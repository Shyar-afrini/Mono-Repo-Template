/// <reference types="node" />
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/primary/index.ts",
  out: "./drizzle/primary",
  dbCredentials: { url: process.env.PRIMARY_DATABASE_URL! },
  verbose: true,
  strict: true,
});
