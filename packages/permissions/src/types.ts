/**
 * Permission string format: "resource:action"
 * Examples: "user:read", "user:write", "user:delete"
 */
export type Permission = string;

/**
 * Props for PermissionGate component
 */
export interface PermissionGateProps {
  /**
   * Single permission to check
   */
  permission?: Permission;
  /**
   * Multiple permissions to check
   */
  permissions?: Permission[];
  /**
   * If true, requires ALL permissions (AND logic)
   * If false, requires ANY permission (OR logic)
   * Default: false
   */
  requireAll?: boolean;
  /**
   * Component to render if permission check fails
   */
  fallback?: React.ReactNode;
  /**
   * Children to render if permission check passes
   */
  children: React.ReactNode;
}

/**
 * Hook options for permission checking
 */
export interface UsePermissionOptions {
  /**
   * If true, requires ALL permissions (AND logic)
   * If false, requires ANY permission (OR logic)
   * Default: false
   */
  requireAll?: boolean;
}
