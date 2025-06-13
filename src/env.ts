import { z } from "zod";

const envSchema = z.object({
  MONGODB_USERNAME: z.string(),
  MONGODB_PASSWORD: z.string(),
  JWT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
