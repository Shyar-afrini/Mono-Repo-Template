"use client";

import { ScrollArea, ScrollBar } from "@mono-repo-template/ui";
import type { NavGroup } from "./sidebar-config";
import NavGroupComponent from "./nav-group";

interface NavMainProps {
  groups: NavGroup[];
}

const NavMain = ({ groups }: NavMainProps) => {
  return (
    <ScrollArea>
      {groups.map((group) => (
        <NavGroupComponent key={group.group} group={group} />
      ))}
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};

export default NavMain;
