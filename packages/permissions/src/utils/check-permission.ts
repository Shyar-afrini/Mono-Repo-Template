import type { Permission } from "../types";

/**
 * Check if a single permission exists in the permissions array
 */
export function checkPermission(
  permissions: Permission[],
  required: Permission
): boolean {
  return permissions.includes(required);
}

/**
 * Check if ANY of the required permissions exist (OR logic)
 */
export function checkAnyPermission(
  permissions: Permission[],
  required: Permission[]
): boolean {
  if (required.length === 0) return true;
  return required.some((perm) => permissions.includes(perm));
}

/**
 * Check if ALL of the required permissions exist (AND logic)
 */
export function checkAllPermissions(
  permissions: Permission[],
  required: Permission[]
): boolean {
  if (required.length === 0) return true;
  return required.every((perm) => permissions.includes(perm));
}

/**
 * Main permission checker that supports both single and multiple permissions
 */
export function hasPermission(
  permissions: Permission[],
  required: Permission | Permission[],
  requireAll: boolean = false
): boolean {
  if (Array.isArray(required)) {
    return requireAll
      ? checkAllPermissions(permissions, required)
      : checkAnyPermission(permissions, required);
  }
  return checkPermission(permissions, required);
}
