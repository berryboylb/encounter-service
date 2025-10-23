import dotenv from "dotenv";
import { z } from "zod";
import { randomBytes } from "crypto";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),

  HOST: z.string().min(1).default("localhost"),

  PORT: z.coerce.number().int().positive().default(8080),

  // CORS_ORIGIN: z.string().url().default("http://localhost:8080"),

  COMMON_RATE_LIMIT_MAX_REQUESTS: z.coerce
    .number()
    .int()
    .positive()
    .default(1000),

  COMMON_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(1000),

  ACCESS_TOKEN_SECRET: z.string().min(1),
  REFRESH_TOKEN_SECRET: z.string().min(1),

  MAIL_MAILER: z.string().default("smtp"),
  MAIL_HOST: z.string().default("localhost"),
  MAIL_PORT: z.coerce.number().default(1025), // MailHog / Mailtrap local
  MAIL_USERNAME: z.string().default(""),
  MAIL_PASSWORD: z.string().default(""),
  MAIL_ENCRYPTION: z.string().default("none"),
  MAIL_FROM_ADDRESS: z.string().default("no-reply@example.com"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.format());
  throw new Error("Invalid environment variables");
}

export const env = {
  ...parsedEnv.data,
  isDevelopment: parsedEnv.data.NODE_ENV === "development",
  isProduction: parsedEnv.data.NODE_ENV === "production",
  isTest: parsedEnv.data.NODE_ENV === "test",
};
