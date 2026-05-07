import { create } from "zustand";
import type { Permission } from "@mono-repo-template/permissions";
import { CurrentUser } from "@mono-repo-template/types";

interface PermissionsStore {
  permissions: Permission[];
  setPermissions: (permissions: Permission[]) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  clearPermissions: () => void;
}

export const usePermissionsStore = create<PermissionsStore>((set, get) => ({
  permissions: [],
  setPermissions: (permissions) => set({ permissions }),

  hasPermission: (permission) => {
    const { permissions } = get();
    return permissions.includes(permission);
  },

  hasAnyPermission: (required) => {
    const { permissions } = get();
    if (required.length === 0) return true;
    return required.some((perm) => permissions.includes(perm));
  },

  hasAllPermissions: (required) => {
    const { permissions } = get();
    if (required.length === 0) return true;
    return required.every((perm) => permissions.includes(perm));
  },

  clearPermissions: () => set({ permissions: [] }),
}));
