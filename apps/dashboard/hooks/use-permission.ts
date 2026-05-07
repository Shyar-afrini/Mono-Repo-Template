"use client";

import { useMemo } from "react";
import { usePermissionsStore } from "../store/permissions.store";
import { hasPermission } from "@mono-repo-template/permissions";
import type { Permission } from "@mono-repo-template/permissions";

/**
 * Dashboard-specific hook to check permissions using the Zustand store
 * This provides direct access to the store without requiring context
 */
export function usePermission(required: Permission): boolean {
  const permissions = usePermissionsStore((state) => state.permissions);
  return useMemo(
    () => hasPermission(permissions, required),
    [permissions, required]
  );
}

/**
 * Dashboard-specific hook to check multiple permissions using the Zustand store
 */
export function usePermissions(
  required: Permission[],
  requireAll: boolean = false
): boolean {
  const permissions = usePermissionsStore((state) => state.permissions);
  return useMemo(
    () => hasPermission(permissions, required, requireAll),
    [permissions, required, requireAll]
  );
}
