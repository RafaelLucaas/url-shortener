import { Router } from "express";
import { z, ZodError } from "zod";
import { UrlModel } from "../../models/url.model";

const router = Router();

export default router.post("/shorten", async (req, res) => {
  const bodySchema = z.object({
    originalUrl: z
      .string({ message: "originalUrl is required in the body." })
      .url({ message: "originalUrl must be a valid link." }),
  });

  try {
    const { originalUrl } = bodySchema.parse(req.body);

    const characters =
      "ABCDEFGKIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const codeLength = 6;
    let code = "";
    let doesCodeExistInDB = true;

    while (doesCodeExistInDB) {
      for (let i = 0; i < codeLength; i++) {
        const index = Math.floor(Math.random() * characters.length);
        code += characters[index];
      }

      const isCodeInDB = await UrlModel.findOne({ shortUrlCode: code });

      if (!isCodeInDB) {
        doesCodeExistInDB = false;
        console.log("Não tem o code no database");
      } else {
        console.log("O Code já existe no DB");
        return;
      }
    }

    const dataToDB = {
      createdAt: Date.now(),
      shortUrlCode: code,
      originalUrl,
    };

    try {
      const url = await UrlModel.create(dataToDB);

      const shortUrl = `${req.protocol}://${req.headers.host}/${url.shortUrlCode}`;

      const resResult = {
        createdAt: url.createdAt,
        shortUrl,
        shortUrlCode: url.shortUrlCode,
        originalUrl: url.originalUrl,
      };

      res.status(201).json(resResult);
    } catch (error) {
      if (error) {
        res.status(500).json({ error });
        return;
      }
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
