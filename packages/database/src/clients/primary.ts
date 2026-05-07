import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as primarySchema from "../schema/primary";
import { env } from "../env";

const pool = new Pool({ connectionString: env.PRIMARY_DATABASE_URL! });

export type PrimaryDb = NodePgDatabase<typeof primarySchema>;
export const primaryDb = drizzle(pool, {
  schema: primarySchema,
}) satisfies PrimaryDb;
export * as PrimarySchema from "../schema/primary";
