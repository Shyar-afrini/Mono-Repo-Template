import type { Permission } from "@mono-repo-template/permissions";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Blocks,
  Building,
  Building2,
  Car,
  ChartBar,
  Contact,
  CreditCard,
  DoorOpen,
  FileClock,
  FileText,
  Home,
  Landmark,
  Layers,
  LayoutGrid,
  LifeBuoy,
  Map,
  Megaphone,
  Package,
  Percent,
  Receipt,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";

export type DropdownItem = {
  name: string;
  path: string;
  icon?: LucideIcon;
  permission?: Permission;
};

export type NavItem = {
  name: string;
  path?: string;
  icon?: LucideIcon;
  permission?: Permission;
  dropdown?: DropdownItem[];
};

export type NavGroup = {
  group: string;
  items: NavItem[];
};

type TranslationFunction = (
  key: Parameters<
    ReturnType<typeof import("next-intl").useTranslations<"sidebar">>
  >[0]
) => string;

/**
 * Get sidebar navigation groups with permission requirements
 * This will be filtered based on user permissions
 */
export const getSidebarGroups = (t: TranslationFunction): NavGroup[] => [
  {
    group: t("groups.settings"),
    items: [
      {
        name: t("items.adminsRoles"),
        icon: ShieldCheck,
        permission: "admin:read",
        dropdown: [
          {
            name: t("items.admins"),
            path: "/dashboard/admins",
            icon: Users,
            permission: "admin:read",
          },
          {
            name: t("items.rolesPermissions"),
            path: "/dashboard/admins/permissions/roles",
            icon: ShieldCheck,
            permission: "admin:read",
          },
        ],
      },
      {
        name: t("items.systemSettings"),
        path: "/dashboard/settings",
        icon: Settings,
      },
    ],
  },
];
