import { config } from "dotenv";
import { join } from "path";
import { z } from "zod";

// Try to load .env from multiple locations
config({ path: join(process.cwd(), ".env") });

const cwd = process.cwd();
const serviceName = process.env.SERVICE_NAME || "";

const isPrimary = serviceName === "primary-backend" || cwd.includes("primary-backend");

const Env = z.object({
  PRIMARY_DATABASE_URL: isPrimary ? z.string() : z.string().optional(),
});

type Env = z.infer<typeof Env>;

export const env: Env = Env.parse({
  PRIMARY_DATABASE_URL: process.env.PRIMARY_DATABASE_URL,
});
