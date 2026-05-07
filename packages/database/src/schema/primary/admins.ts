import {
  InferInsertModel,
  InferSelectModel,
  relations,
  sql,
} from "drizzle-orm";
import {
  boolean,
  index,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { roles } from "./permissions";

// =====================
// admins table + INDEXES
// =====================
export const admins = pgTable(
  "admins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullname: varchar("fullname", { length: 120 }).notNull(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 32 }),

    profilePhoto: text("profile_photo"),
    roleId: uuid("role_id").references(() => roles.id, {
      onDelete: "restrict",
    }),

    isActive: boolean("is_active").notNull().default(true),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // indexes
    uniqueIndex("uq_admins_email").on(t.email),
    index("idx_admins_created_at").on(t.createdAt),
    index("idx_admins_is_active").on(t.isActive),

    // ---- RLS policies (examples) ----
    // Only allow SELECT of “self” (session user) — assumes you SET app.user_id in the session
    pgPolicy("admins_select", {
      for: "select",
      to: "public", // or 'public' / 'current_user' etc.
      using: sql`${t.id} = (current_setting('app.user_id', true))::uuid`,
    }),

    // Allow UPDATE only on your own row
    pgPolicy("admins_update", {
      for: "update",
      to: "public",
      using: sql`${t.id} = (current_setting('app.user_id', true))::uuid`,
      withCheck: sql`${t.id} = (current_setting('app.user_id', true))::uuid`,
    }),

    // (Optional) block INSERTs from app role (service/admin can insert). If you want to allow:
    pgPolicy("admins_insert_self", {
      for: "insert",
      to: "public",
      withCheck: sql`${t.id} = (current_setting('app.user_id', true))::uuid`,
    }),
  ]
).enableRLS();

// ----- Zod schemas -----
export const selectAdminSchema = createSelectSchema(admins);
export const insertAdminSchema = createInsertSchema(admins);
export const updateAdminSchema = insertAdminSchema.partial();

export type Admin = InferSelectModel<typeof admins>;
export type NewAdmin = InferInsertModel<typeof admins>;
export type UpdateAdmin = z.infer<typeof updateAdminSchema>;

export const AuthInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type AuthInput = z.infer<typeof AuthInputSchema>;

export const adminRelations = relations(admins, ({ one }) => ({
  role: one(roles, {
    fields: [admins.roleId],
    references: [roles.id],
  }),
}));

