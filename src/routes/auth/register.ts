import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { zodValidation } from "../../middlewares/zod-validation";
import path from "node:path";
import crypto from "node:crypto";
import { UserModel } from "../../models/user.model";

const router = Router();

const userSchema = z
  .object({
    name: z
      .string({ message: "name is missing on body." })
      .min(3, { message: "name must be at least 3 character long" }),
    email: z
      .string({ message: "email is missing on body." })
      .email({ message: "invalid email" }),
    password: z
      .string({ message: "password is missing on body." })
      .min(6, { message: "password must be at least 6 characters long" }),
    confirmPassword: z.string({
      message: "confirmPassword is missing on body.",
    }),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type UserSchemaType = z.infer<typeof userSchema>;

export default router.post(
  "/register",
  zodValidation("body", userSchema),
  async (req, res) => {
    const { name, email, password }: UserSchemaType = req.body;

    try {
      const userExists = await UserModel.findOne({ email });

      if (userExists) {
        res.status(400).json({
          success: false,
          message: "Email is invalid or already in use",
        });
        return;
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = new UserModel({
        name,
        email,
        password: passwordHash,
      });

      const token = crypto.randomBytes(32).toString("hex");

      user.token = token;

      await user.save();

      res.status(201).json({
        success: true,
        message: "Account created successfully",
        token,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Internal server error. (${path.basename(import.meta.filename)})`,
      });
      return;
    }
  },
);
