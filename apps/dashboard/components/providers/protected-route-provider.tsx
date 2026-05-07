"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { usePermissionsStore } from "@/store/permissions.store";
import { getRoutePermissionConfig } from "@/config/route-permissions";
import { hasPermission } from "@mono-repo-template/permissions";

/**
 * ProtectedRouteProvider - Protects routes based on permissions
 * Checks current route against route permissions config and redirects if user lacks required permissions
 */
export function ProtectedRouteProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const permissions = usePermissionsStore((state) => state.permissions);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Skip check if permissions are not loaded yet
    if (permissions.length === 0) {
      setIsChecking(false);
      return;
    }

    // Normalize pathname by removing locale prefix (e.g., /en/dashboard/users -> /dashboard/users)
    const normalizedPathname = pathname.replace(/^\/[^/]+/, "") || "/";

    // Get permission config for current route
    const routeConfig = getRoutePermissionConfig(normalizedPathname);

    // If no config found, route is public - allow access
    if (!routeConfig) {
      setIsChecking(false);
      return;
    }

    // Check if user has required permission(s)
    let hasAccess = false;

    if (typeof routeConfig.permission === "string") {
      // Single permission
      hasAccess = hasPermission(permissions, routeConfig.permission);
    } else if (Array.isArray(routeConfig.permission)) {
      // Multiple permissions (OR logic)
      hasAccess = hasPermission(permissions, routeConfig.permission, false);
    } else {
      // Object with permissions array and requireAll flag
      hasAccess = hasPermission(
        permissions,
        routeConfig.permission.permissions,
        routeConfig.permission.requireAll
      );
    }

    // If user doesn't have access, redirect to previous route or home
    if (!hasAccess) {
      // Try to go back in history, or redirect to home
      if (
        globalThis.window !== undefined &&
        globalThis.window.history.length > 1
      ) {
        router.back();
      } else {
        // Extract locale from pathname (e.g., /en/dashboard/users -> /en/dashboard/home)
        const locale = pathname.split("/")[1];
        router.push(`/${locale}/dashboard/home`);
      }
      return;
    }

    setIsChecking(false);
  }, [pathname, permissions, router]);

  // Show nothing while checking (or show a loading state if needed)
  if (isChecking) {
    return null;
  }

  return <>{children}</>;
}
