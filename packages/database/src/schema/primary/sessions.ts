import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
  index,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { admins } from "./admins";

/** ADMIN SESSIONS */
export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionToken: text("session_token").notNull(),
    adminId: uuid("admin_id")
      .notNull()
      .references(() => admins.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Indexes
    index("admin_sessions_admin_id_idx").on(t.adminId),
    index("admin_sessions_expires_at_idx").on(t.expiresAt),
    index("admin_sessions_admin_id_expires_idx").on(t.adminId, t.expiresAt),
    uniqueIndex("admin_sessions_session_token_uq").on(t.sessionToken),
    uniqueIndex("admin_sessions_admin_token_uq").on(t.adminId, t.sessionToken),

    // ---- RLS policies ----
    // Only allow admins to access their own sessions
    pgPolicy("admin_sessions_select", {
      for: "select",
      to: "public",
      using: sql`${t.adminId} = (current_setting('app.user_id', true))::uuid`,
    }),

    // Only allow admins to insert their own sessions
    pgPolicy("admin_sessions_insert", {
      for: "insert",
      to: "public",
      withCheck: sql`${t.adminId} = (current_setting('app.user_id', true))::uuid`,
    }),

    // Only allow admins to update their own sessions
    pgPolicy("admin_sessions_update", {
      for: "update",
      to: "public",
      using: sql`${t.adminId} = (current_setting('app.user_id', true))::uuid`,
      withCheck: sql`${t.adminId} = (current_setting('app.user_id', true))::uuid`,
    }),

    // Only allow admins to delete their own sessions
    pgPolicy("admin_sessions_delete", {
      for: "delete",
      to: "public",
      using: sql`${t.adminId} = (current_setting('app.user_id', true))::uuid`,
    }),
  ]
).enableRLS();

export const AdminSessionSchema = createSelectSchema(adminSessions);
export const NewAdminSessionSchema = createInsertSchema(adminSessions);
export const UpdateAdminSessionSchema = NewAdminSessionSchema.partial();
export type AdminSession = InferSelectModel<typeof adminSessions>;
export type NewAdminSession = InferInsertModel<typeof adminSessions>;
export type UpdateAdminSession = z.infer<typeof UpdateAdminSessionSchema>;
