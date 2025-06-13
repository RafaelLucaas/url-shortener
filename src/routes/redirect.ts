import { Router } from "express";
import { z, ZodError } from "zod";
import { UrlModel } from "../models/url.model";
import { zodValidation } from "../middlewares/zod-validation";
import path from "node:path";

const router = Router();

const paramsSchema = z.object({
  shortCode: z.string({
    message: "originalUrl is required in the params",
  }),
});

export default router.get(
  "/:shortCode",
  zodValidation("params", paramsSchema),
  async (req, res) => {
    const { shortCode } = req.params;

    try {
      const validShortUrl = await UrlModel.findOne({
        $or: [{ shortCode }, { customAlias: shortCode }],
      });

      if (!validShortUrl) {
        res.status(404).json({ success: false, message: "Invalid URL" });
        return;
      }

      const update = await UrlModel.updateOne(
        { _id: validShortUrl.id },
        {
          clicks: validShortUrl.clicks + 1,
          lastAccessedAt: Date.now(),
        },
      );
      console.log(update);

      res.status(301).redirect(validShortUrl.originalUrl);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors[0].message;
        res.status(400).json({ success: false, message: errorMessage });
        return;
      }

      res.status(500).json({
        success: false,
        message: `Internal Server Error (${path.basename(import.meta.filename)})`,
      });
    }
  },
);
