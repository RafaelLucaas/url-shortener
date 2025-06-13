import { Router } from "express";
import { z } from "zod";
import { UrlModel } from "../../models/url.model";
import { zodValidation } from "../../middlewares/zod-validation";
import { UserModel } from "../../models/user.model";
import path from "node:path";

const router = Router();

const bodySchema = z.object({
  originalUrl: z
    .string({ message: "originalUrl is required in the body." })
    .url({ message: "originalUrl must be a valid link." }),
  customAlias: z
    .string({ message: "customAlias is required in the body" })
    .min(3, { message: "customAlias must be at least 3 characters long" })
    .optional(),
});

const headersSchema = z.object({
  Authorization: z.string().optional(),
});

export default router.post(
  "/shorten",
  zodValidation("body", bodySchema),
  zodValidation("headers", headersSchema),
  async (req, res) => {
    const { originalUrl, customAlias } = req.body;
    const { authorization } = req.headers;

    async function generateShortCode(): Promise<string> {
      const characters =
        "ABCDEFGKIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const codeLength = 6;
      let code = "";

      while (true) {
        for (let i = 0; i < codeLength; i++) {
          const index = Math.floor(Math.random() * characters.length);
          code += characters[index];
        }

        const isCodeInDB = await UrlModel.findOne({
          $or: [{ shortCode: code }, { customAlias: code }],
        });

        if (!isCodeInDB) return code;
      }
    }

    try {
      const token =
        authorization && typeof authorization === "string"
          ? authorization.split(" ")[1]
          : undefined;

      let user = null;

      if (token) {
        user = await UserModel.findOne({ token });
        if (!user && customAlias) {
          res.status(401).json({
            success: false,
            message: "Unauthorized or Invalid Token",
          });
          return;
        }
      } else if (!token && customAlias) {
        res.status(401).json({
          success: false,
          message: "Unauthorized or Invalid Token",
        });
        return;
      }
      if (customAlias) {
        const customAliasExists = await UrlModel.findOne({
          $or: [{ customAlias }, { shortCode: customAlias }],
        });

        if (customAliasExists) {
          res.status(409).json({
            success: false,
            message: "customAlias already exists",
          });
          return;
        }
      }

      const shortCode = await generateShortCode();

      const newUrlData = new UrlModel({
        shortCode,
        originalUrl,
      });

      if (user) newUrlData.userId = user.id;
      if (customAlias) newUrlData.customAlias = customAlias;

      await newUrlData.save();

      if (user) {
        await UserModel.updateOne(
          { _id: user._id },
          {
            $addToSet: { urls: newUrlData._id },
          },
        );
      }

      const shortUrl = `${req.protocol}://${req.headers.host}/${newUrlData.shortCode}`;

      res.status(201).json({
        success: true,
        message: "Short URL created successfully!",
        data: { shortUrl },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: `Internal Server Error (${path.basename(import.meta.filename)})`,
      });
      return;
    }
  },
);
