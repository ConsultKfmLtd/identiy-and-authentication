import "dotenv/config";
import { z } from "zod";

/*
  This file defines the environment variables schema using Zod and exports a validated `env` object. It ensures that all required environment variables are present and have the correct types, providing defaults where applicable.
*/
const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(900),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().default(60 * 60 * 24 * 30),

  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  COOKIE_SECURE: z.coerce.boolean().default(false)
});

export const env = envSchema.parse(process.env);
