import type { Admin } from "@mono-repo-template/database";

/**
 * Role with permissions array
 */
export interface RoleWithPermissions {
  id: string;
  name: string;
  permissions: string[];
}

/**
 * Current user with role and permissions
 * Extends Admin to include role with permissions array
 */
export type CurrentUser = Admin & {
  role: RoleWithPermissions | null;
}
