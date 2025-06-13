import { z } from "zod";

const envSchema = z.object({
  MONGODB_USERNAME: z.string(),
  MONGODB_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);
