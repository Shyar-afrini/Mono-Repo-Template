"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@mono-repo-template/ui";
import type { NavGroup } from "./sidebar-config";
import NavItemComponent from "./nav-item";

interface NavGroupProps {
  group: NavGroup;
}

const NavGroupComponent = ({ group }: NavGroupProps) => {
  // Filter out items that don't have any visible items (empty groups)
  if (group.items.length === 0) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group.items.map((item) => (
            <NavItemComponent key={item.name} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default NavGroupComponent;
