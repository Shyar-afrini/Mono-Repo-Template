"use client";

import React, { createContext, useContext } from "react";
import type { PermissionGateProps, Permission } from "../types";
import { hasPermission } from "../utils";

/**
 * Permissions Context
 */
interface PermissionsContextValue {
  permissions: Permission[];
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

/**
 * Hook to access permissions from context
 */
export function usePermissionsContext(): Permission[] {
  const context = useContext(PermissionsContext);
  if (!context) {
    // Return empty array if context is not available (fail-safe)
    console.warn(
      "usePermissionsContext: PermissionsContext not found. Make sure PermissionsProvider is set up."
    );
    return [];
  }
  return context.permissions;
}

/**
 * PermissionGate - Conditionally renders children based on permissions
 *
 * @example
 * ```tsx
 * // Single permission
 * <PermissionGate permission="user:delete">
 *   <DeleteButton />
 * </PermissionGate>
 *
 * // Multiple permissions (OR logic)
 * <PermissionGate permissions={["user:delete", "admin:delete"]}>
 *   <DeleteButton />
 * </PermissionGate>
 *
 * // Multiple permissions (AND logic)
 * <PermissionGate permissions={["user:read", "user:write"]} requireAll>
 *   <EditButton />
 * </PermissionGate>
 *
 * // With fallback
 * <PermissionGate permission="admin:write" fallback={<div>No access</div>}>
 *   <CreateButton />
 * </PermissionGate>
 * ```
 */
export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  // Get permissions from context
  const userPermissions = usePermissionsContext();

  // Determine which permission(s) to check
  const required = permission ? [permission] : permissions ? permissions : [];

  // Check permissions
  const hasAccess = hasPermission(userPermissions, required, requireAll);

  // Render based on permission check
  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * PermissionsProvider - Provides permissions to child components
 * This should be set up in your app's provider tree
 */
export interface PermissionsProviderProps {
  permissions: Permission[];
  children: React.ReactNode;
}

export function PermissionsProvider({
  permissions,
  children,
}: PermissionsProviderProps) {
  return (
    <PermissionsContext.Provider value={{ permissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}
