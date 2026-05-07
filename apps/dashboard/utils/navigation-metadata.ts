/**
 * Navigation Metadata Utilities
 * Helper functions to get page title and icon from navigation config
 */

import type { NavGroup, NavItem, DropdownItem } from "@/components/navigation/sidebar-config";
import { getSidebarGroups } from "@/components/navigation/sidebar-config";
import type { LucideIcon } from "lucide-react";

type TranslationFunction = (
  key: Parameters<
    ReturnType<typeof import("next-intl").useTranslations<"sidebar">>
  >[0]
) => string;

/**
 * Normalize path by removing locale prefix
 */
export const normalizePath = (path: string): string => {
  // Remove locale prefix if present (e.g., /ar/dashboard/users -> /dashboard/users)
  // Also handle paths that start with /dashboard directly
  const normalized = path.replace(/^\/(ar|en|ku)\//, "/").replace(/^\/(ar|en|ku)$/, "/");
  return normalized || "/";
};

/**
 * Find navigation item by path
 */
const findNavItemByPath = (
  groups: NavGroup[],
  path: string
): { item: NavItem | DropdownItem; isDropdown: boolean } | null => {
  // Normalize path (remove locale prefix if present)
  const normalizedPath = normalizePath(path);

  for (const group of groups) {
    for (const item of group.items) {
      // Check main item path
      if (item.path === normalizedPath) {
        return { item, isDropdown: false };
      }

      // Check dropdown items
      if (item.dropdown) {
        for (const dropdownItem of item.dropdown) {
          if (dropdownItem.path === normalizedPath) {
            return { item: dropdownItem, isDropdown: true };
          }
        }
      }
    }
  }

  return null;
};

/**
 * Get page metadata (title and icon) from navigation config
 */
export const getPageMetadata = (
  path: string,
  t: TranslationFunction
): { title: string; icon?: LucideIcon } | null => {
  const groups = getSidebarGroups(t);
  const result = findNavItemByPath(groups, path);

  if (!result) {
    return null;
  }

  return {
    title: result.item.name,
    icon: result.item.icon,
  };
};

