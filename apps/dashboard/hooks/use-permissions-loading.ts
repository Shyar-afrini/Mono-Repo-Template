"use client";

import { createAuthClient } from "@mono-repo-template/auth";
import { usePermissionsStore } from "@/store/permissions.store";

/**
 * Hook to check if permissions are currently loading
 * Returns true if auth is loading or permissions haven't been set yet
 */
export function usePermissionsLoading(): boolean {
  const authClient = createAuthClient();
  const { data: currentUser, isLoading: authLoading } =
    authClient.getCurrentUser();
  const permissions = usePermissionsStore((state) => state.permissions);

  // Loading if:
  // 1. Auth is still loading
  // 2. Auth finished but we have a user and permissions haven't been set yet
  const permissionsLoading =
    authLoading ||
    (currentUser && currentUser.role && permissions.length === 0);

  return permissionsLoading ?? false;
}
