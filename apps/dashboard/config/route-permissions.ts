import type { Permission } from "@mono-repo-template/permissions";

/**
 * Route permission configuration
 * Maps route patterns to required permissions
 *
 * Route patterns support:
 * - Exact matches: "/dashboard/users"
 * - Pattern matching: "/dashboard/users/*" (matches all sub-routes)
 *
 * Permission requirements:
 * - Single permission: "user:read"
 * - Multiple permissions (OR): ["user:read", "admin:read"] - user needs ANY
 * - Multiple permissions (AND): { permissions: ["user:read", "user:write"], requireAll: true } - user needs ALL
 */
export interface RoutePermissionConfig {
  /**
   * Route pattern to match (supports wildcards with *)
   */
  route: string;
  /**
   * Required permission(s)
   * Can be a single permission, array of permissions (OR logic), or object with AND logic
   */
  permission:
  | Permission
  | Permission[]
  | {
    permissions: Permission[];
    requireAll: boolean;
  };
}

/**
 * Route permissions configuration
 * Add routes here that require permission checks
 */
export const ROUTE_PERMISSIONS: RoutePermissionConfig[] = [
  // Admins routes
  {
    route: "/dashboard/admins",
    permission: "admin:read",
  },
  {
    route: "/dashboard/admins/*",
    permission: "admin:read",
  },
  {
    route: "/dashboard/admins/permissions/roles",
    permission: "admin:read", // or we could use a specific permission like "role:read" if it exists
  },
  {
    route: "/dashboard/admins/permissions/roles/*",
    permission: "admin:read",
  },
];

/**
 * Check if a route matches a pattern (supports wildcards)
 */
export function matchRoute(pathname: string, pattern: string): boolean {
  // Convert pattern to regex
  // Split by * to handle wildcards, then escape slashes in each part
  const parts = pattern.split("*");
  const escapedParts = parts.map((part) => part.replace(/\//g, "\\/"));
  const regexPattern = escapedParts.join(".*");
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pathname);
}

/**
 * Find permission config for a route
 */
export function getRoutePermissionConfig(
  pathname: string
): RoutePermissionConfig | undefined {
  return ROUTE_PERMISSIONS.find((config) => matchRoute(pathname, config.route));
}
