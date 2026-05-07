import { or, SQL } from "drizzle-orm";

export {
  and,
  asc, between, desc,
  DrizzleError,
  DrizzleQueryError,
  eq,
  exists,
  gt,
  gte,
  ilike,
  inArray, isNotNull,
  isNull,
  like,
  lt,
  lte, not, notInArray, or,
  sql,
  type DrizzleTypeError,
  type SQLWrapper
} from "drizzle-orm";
export { pgTable, PgTable } from "drizzle-orm/pg-core";

export * from "./clients/primary";
export * from "./tokens";

export * from "./constants/permissions";
export * from "./schema/primary";

export function optionalOr(...conds: (SQL | undefined)[]) {
  const c = conds.filter(Boolean) as SQL[];
  if (c.length === 0) return undefined; // no filter
  if (c.length === 1) return c[0]; // single condition
  return or(...(c as [SQL, SQL, ...SQL[]])); // 2+ conditions
}
