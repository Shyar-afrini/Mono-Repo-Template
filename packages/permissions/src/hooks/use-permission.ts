import { useMemo } from "react";
import type { Permission, UsePermissionOptions } from "../types";
import { hasPermission } from "../utils";
import { usePermissionsContext } from "../components/permission-gate";

/**
 * Hook to check if user has a single permission
 * Uses permissions from PermissionsContext
 * @param required - Permission to check
 * @returns boolean indicating if permission exists
 */
export function usePermission(required: Permission): boolean {
  const permissions = usePermissionsContext();
  return useMemo(
    () => hasPermission(permissions, required),
    [permissions, required]
  );
}

/**
 * Hook to check if user has multiple permissions
 * Uses permissions from PermissionsContext
 * @param required - Permissions to check
 * @param options - Options for checking (requireAll for AND/OR logic)
 * @returns boolean indicating if permissions exist
 */
export function usePermissions(
  required: Permission[],
  options?: UsePermissionOptions
): boolean {
  const permissions = usePermissionsContext();
  const requireAll = options?.requireAll ?? false;

  return useMemo(
    () => hasPermission(permissions, required, requireAll),
    [permissions, required, requireAll]
  );
}
