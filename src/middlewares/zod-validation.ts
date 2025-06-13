import { RequestHandler } from "express";
import { ZodError, ZodSchema } from "zod";

export function zodValidation(
  source: "body" | "query" | "params" | "headers",
  schema: ZodSchema,
): RequestHandler {
  return (req, res, next) => {
    if (!req[source]) {
      res.status(400).json({
        success: false,
        message: `${source} está faltando na requisição!`,
      });
      return;
    }

    try {
      const data = schema.parse(req[source]);

      if (source !== "headers") {
        req[source] = data;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.errors[0].message;
        res.status(400).json({ success: false, message: errorMessage });
        return;
      }

      res.status(500).json({ success: false, message: "" });
    }
  };
}
