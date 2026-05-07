"use client";

import type { Permission } from "@mono-repo-template/permissions";
import { usePermissionsStore } from "@/store/permissions.store";
import type { NavGroup, NavItem, DropdownItem } from "./sidebar-config";

/**
 * Check if user has required permission
 */
function hasPermission(
  permissions: Permission[],
  required?: Permission
): boolean {
  if (!required) return true; // No permission required
  return permissions.includes(required);
}

/**
 * Filter dropdown items based on permissions
 */
function filterDropdownItems(
  items: DropdownItem[],
  permissions: Permission[]
): DropdownItem[] {
  return items.filter((item) => hasPermission(permissions, item.permission));
}

/**
 * Filter nav items based on permissions
 */
function filterNavItems(
  items: NavItem[],
  permissions: Permission[]
): NavItem[] {
  return items
    .map((item) => {
      // If item has dropdown, check dropdown items first
      if (item.dropdown) {
        const filteredDropdown = filterDropdownItems(
          item.dropdown,
          permissions
        );
        // If dropdown has accessible items, include parent regardless of parent permission
        if (filteredDropdown.length > 0) {
          return {
            ...item,
            dropdown: filteredDropdown,
          };
        }
        // No accessible dropdown items, exclude this item
        return null;
      }
      // For items without dropdown, require parent permission
      if (!hasPermission(permissions, item.permission)) {
        return null;
      }
      return item;
    })
    .filter((item): item is NavItem => item !== null);
}

/**
 * Filter sidebar groups based on user permissions
 */
export function filterSidebarGroups(
  groups: NavGroup[],
  permissions: Permission[]
): NavGroup[] {
  return groups
    .map((group) => {
      const filteredItems = filterNavItems(group.items, permissions);
      // Only include group if it has visible items
      if (filteredItems.length === 0) {
        return null;
      }
      return {
        ...group,
        items: filteredItems,
      };
    })
    .filter((group): group is NavGroup => group !== null);
}

/**
 * Hook to get filtered sidebar groups based on current user permissions
 */
export function useFilteredSidebarGroups(groups: NavGroup[]): NavGroup[] {
  const permissions = usePermissionsStore((state) => state.permissions);
  return filterSidebarGroups(groups, permissions);
}
