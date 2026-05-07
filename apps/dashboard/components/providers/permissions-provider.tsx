"use client";

import { useEffect } from "react";
import { PermissionsProvider as BasePermissionsProvider } from "@mono-repo-template/permissions";
import { createAuthClient } from "@mono-repo-template/auth";
import { usePermissionsStore } from "@/store/permissions.store";
import useUser from "@/store/user.store";
import { CurrentUser } from "@mono-repo-template/types";

/**
 * PermissionsProvider - Initializes and provides permissions to the app
 * Fetches current user on mount and extracts permissions from role
 */
export function PermissionsProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { permissions, setPermissions, clearPermissions } =
    usePermissionsStore();
  const authClient = createAuthClient();
  const { data: currentUser, isLoading } = authClient.getCurrentUser();
  const setUserInfo = useUser((state) => state.setUserInfo);

  // Set user info when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setUserInfo(currentUser as unknown as CurrentUser);
    }
  }, [currentUser, setUserInfo]);

  // Initialize permissions from current user
  useEffect(() => {
    if (currentUser?.role?.permissions) {
      setPermissions(currentUser.role.permissions);
    } else if (currentUser && !currentUser.role?.permissions) {
      // User exists but has no role/permissions - clear permissions
      clearPermissions();
    }
  }, [currentUser, setPermissions, clearPermissions]);

  // Clear permissions on logout (when currentUser becomes null/undefined)
  useEffect(() => {
    if (!isLoading && !currentUser) {
      clearPermissions();
    }
  }, [currentUser, isLoading, clearPermissions]);

  // Provide permissions to child components via context
  return (
    <BasePermissionsProvider permissions={permissions}>
      {children}
    </BasePermissionsProvider>
  );
}
