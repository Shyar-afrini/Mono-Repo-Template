import { relations, sql } from "drizzle-orm";
import {
  boolean,
  pgEnum,
  pgPolicy,
  pgTable,
  primaryKey,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import z from "zod";
import { ALL_PERMISSIONS } from "../../constants/permissions";
import { admins } from "./admins";

// =====================
// permissionEnum table
// =====================
export const permissionEnum = pgEnum(
  "permission",
  ALL_PERMISSIONS as [string, ...string[]]
);

// =====================
// roles table + INDEXES
// =====================
export const roles = pgTable(
  "roles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 64 }).notNull().unique(),
    isPrimary: boolean("is_primary").default(false).notNull(),
  },
  (t) => [
    // ---- RLS policies ----
    // Only allow admins with admin:read permission to view roles
    pgPolicy("roles_select", {
      for: "select",
      to: "public",
      using: sql`public.check_permission('admin:read')`,
    }),

    // Only allow admins with admin:write permission to insert roles
    pgPolicy("roles_insert", {
      for: "insert",
      to: "public",
      withCheck: sql`public.check_permission('admin:write')`,
    }),

    // Only allow admins with admin:write permission to update roles
    pgPolicy("roles_update", {
      for: "update",
      to: "public",
      using: sql`public.check_permission('admin:write')`,
      withCheck: sql`public.check_permission('admin:write')`,
    }),

    // Only allow admins with admin:delete permission to delete roles
    pgPolicy("roles_delete", {
      for: "delete",
      to: "public",
      using: sql`public.check_permission('admin:delete')`,
    }),
  ]
).enableRLS();

// =====================
// role_permissions table + INDEXES
// =====================
export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissions: permissionEnum("permissions").notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.roleId, t.permissions] }),

    // ---- RLS policies ----
    // Only allow admins with admin:read permission to view role permissions
    pgPolicy("role_permissions_select", {
      for: "select",
      to: "public",
      using: sql`public.check_permission('admin:read')`,
    }),

    // Only allow admins with admin:write permission to insert role permissions
    pgPolicy("role_permissions_insert", {
      for: "insert",
      to: "public",
      withCheck: sql`public.check_permission('admin:write')`,
    }),

    // Only allow admins with admin:write permission to update role permissions
    pgPolicy("role_permissions_update", {
      for: "update",
      to: "public",
      using: sql`public.check_permission('admin:write')`,
      withCheck: sql`public.check_permission('admin:write')`,
    }),

    // Only allow admins with admin:delete permission to delete role permissions
    pgPolicy("role_permissions_delete", {
      for: "delete",
      to: "public",
      using: sql`public.check_permission('admin:delete')`,
    }),
  ]
).enableRLS();


export type Role = typeof roles.$inferSelect;
export type RoleInsert = typeof roles.$inferInsert & {
  permissions?: string[];
};
export type RoleUpdate = Partial<Role> & {
  permissions?: string[];
};
export type RolePermission = typeof rolePermissions.$inferSelect;
export type RolePermissionInsert = typeof rolePermissions.$inferInsert & {
  permissions?: string[];
};
export type RolePermissionUpdate = Partial<RolePermission> & {
  permissions?: string[];
};

export const RoleSchema = createSelectSchema(roles);
export const RolePermissionSchema = createSelectSchema(rolePermissions);
export const RoleUpdateSchema = createUpdateSchema(roles);
export const RoleUpdateWithPermissionsSchema = RoleUpdateSchema.extend({
  permissions: z.array(z.string()).optional(),
});

export const RoleInsertSchema = createInsertSchema(roles);
export const RoleInsertWithPermissionsSchema = RoleInsertSchema.extend({
  permissions: z.array(z.string()),
});
export const RolePermissionInsertSchema = createInsertSchema(rolePermissions, {
  permissions: z.array(z.string()),
});
export const RolePermissionUpdateSchema = createUpdateSchema(rolePermissions, {
  permissions: z.array(z.string()),
});

// ---- Roles Relationships ----

export const RoleAndPermissionRelation = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
  admins: many(admins),
}));

// ---- Role Permissions Relationships ----

export const RolePermissionRelation = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
}));
