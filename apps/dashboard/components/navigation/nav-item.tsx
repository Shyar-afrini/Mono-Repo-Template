"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  Text,
} from "@mono-repo-template/ui";
import { ChevronRight } from "lucide-react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FlipOnRTL } from "../flip-on-rtl";
import NavBookmarkButton from "./nav-bookmark-button";
import type { NavItem } from "./sidebar-config";

interface NavItemProps {
  item: NavItem;
}

const NavItemComponent = ({ item }: NavItemProps) => {
  const locale = useLocale();
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredSubPath, setHoveredSubPath] = useState<string | null>(null);

  const pathIsActive = (path?: string) => {
    if (!path) return false;
    const exactMatch = path === pathname || `/${locale}${path}` === pathname;

    // Special case: if path is "/dashboard", also match "/dashboard/home"
    if (path === "/dashboard") {
      return (
        exactMatch ||
        pathname === "/dashboard/home" ||
        pathname === `/${locale}/dashboard/home`
      );
    }

    // Special case: if pathname is "/dashboard" or "/dashboard/home", match "/dashboard" path
    if (
      pathname === "/dashboard" ||
      pathname === `/${locale}/dashboard` ||
      pathname === "/dashboard/home" ||
      pathname === `/${locale}/dashboard/home`
    ) {
      return path === "/dashboard";
    }

    return exactMatch;
  };

  const dropdownActive = (dropdown?: typeof item.dropdown) =>
    !!dropdown && dropdown.some((d) => pathname.startsWith(d.path));

  const isTopActive = pathIsActive(item.path) || dropdownActive(item.dropdown);

  if (item.dropdown && item.dropdown.length > 0) {
    return (
      <Collapsible
        defaultOpen={dropdownActive(item.dropdown)}
        className="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton
              isActive={isTopActive}
              className="py-2 h-auto group/item gap-2"
            >
              {item.icon ? <item.icon className="shrink-0" /> : null}
              <Text className="">{item.name}</Text>
              <FlipOnRTL>
                <ChevronRight className="ms-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90 shrink-0" />
              </FlipOnRTL>
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub className="flex flex-col gap-1 mt-2">
              {item.dropdown.map((sub) => {
                const isSubActive = pathIsActive(sub.path);
                const isSubHovered = hoveredSubPath === sub.path;
                return (
                  <SidebarMenuSubItem key={sub.name}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={isSubActive}
                      className="py-1.5 h-auto group/sub"
                    >
                      <Link
                        href={sub.path}
                        className="flex items-center w-full gap-2"
                        onMouseEnter={() => setHoveredSubPath(sub.path)}
                        onMouseLeave={() => setHoveredSubPath(null)}
                      >
                        {sub.icon ? <sub.icon className="shrink-0" /> : null}
                        <span className="">{sub.name}</span>
                        {isSubHovered && (
                          <NavBookmarkButton path={sub.path} title={sub.name} />
                        )}
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isTopActive}
        className="py-2 h-auto group/item"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={item.path ?? "#"}
          className="flex items-center w-full gap-2"
        >
          {item.icon ? <item.icon className="shrink-0" /> : null}
          <span className="">{item.name}</span>
          {isHovered && item.path && (
            <NavBookmarkButton path={item.path} title={item.name} />
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default NavItemComponent;
