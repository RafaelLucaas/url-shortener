import { NextFunction, Request, RequestHandler, Response } from "express";
import { z, ZodError } from "zod";
import bcrypt from "bcrypt";
import path from "node:path";
import { UserModel } from "../models/user.model";

export const bodySchema = z.object({
  email: z
    .string({ message: "Email must be a string" })
    .email({ message: "Email must be valid" }),
  password: z
    .string({ message: "Password must be a string" })
    .min(1, { message: "Password is required" }),
});
export type UserCredentials = z.infer<typeof bodySchema>;

export function IsAuthenticated(): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body) {
      res.status(400).json({
        success: false,
        message: `body está faltando na requisição!`,
      });
      return;
    }

    try {
      const { email, password } = bodySchema.parse(req.body);

      try {
        const user = await UserModel.findOne({ email });

        if (!user) {
          res
            .status(401)
            .json({ success: false, message: "Invalid email or password" });
          return;
        }

        const checkPassword = await bcrypt.compare(password, user.password);

        if (!checkPassword) {
          res
            .status(401)
            .json({ success: false, message: "Invalid email or password" });
          return;
        }

        next();
      } catch (error) {
        console.log(error);
        res.status(500).json({
          success: false,
          message: `Internal Server Error (${path.basename(import.meta.filename)})`,
        });
        return;
      }
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors[0].message;
        res.status(400).json({ success: false, message: errorMessage });
        return;
      }
    }
  };
}
