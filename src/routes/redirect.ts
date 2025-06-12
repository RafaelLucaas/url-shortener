import { Router } from "express";
import { z, ZodError } from "zod";
import { UrlModel } from "../models/url.model";

const router = Router();

export default router.get("/:shortUrlCode", async (req, res) => {
  const paramsSchema = z.object({
    shortUrlCode: z.string({
      message: "originalUrl is required in the params",
    }),
  });

  try {
    const { shortUrlCode } = paramsSchema.parse(req.params);

    try {
      const data = await UrlModel.findOne({ shortUrlCode });

      if (!data) {
        res.status(404).json({ error: `Essa url não existe.` });
        return;
      }

      await UrlModel.updateOne(
        { shortUrlCode: data.shortUrlCode },
        {
          clicks: data.clicks + 1,
          lastAccessedAt: Date.now(),
        },
      );

      res.redirect(data.originalUrl);
    } catch (error) {
      res.status(500).json({ error });
      return;
    }
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage = error.errors[0].message;
      res.status(400).json({ error: errorMessage });
      return;
    }

    res.status(500).json({
      error: "Erro interno do servidor, o erro foi causado por causa do Zod",
    });
  }
});
