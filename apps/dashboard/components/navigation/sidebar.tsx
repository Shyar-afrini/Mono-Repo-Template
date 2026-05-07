"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu
} from "@mono-repo-template/ui";
import React from "react";

import { usePermissionsLoading } from "@/hooks/use-permissions-loading";
import { useTranslations } from "next-intl";
import NavMain from "./nav-main";
import { NavUser } from "./nav-user";
import { getSidebarGroups } from "./sidebar-config";
import { SidebarContentSkeleton } from "./sidebar-skeletons";
import { useFilteredSidebarGroups } from "./sidebar-utils";

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const t = useTranslations("sidebar");
  const isLoading = usePermissionsLoading();

  // Get all sidebar groups from config
  const allGroups = getSidebarGroups(t);

  // Filter groups based on user permissions
  const filteredGroups = useFilteredSidebarGroups(allGroups);

  return (
    <Sidebar
      {...props}
      collapsible="offcanvas"
      className="border-none p-3 rounded-lg!"
    >
      <SidebarHeader>
        <SidebarMenu>
          {// TODO: Add sidebar header
          }
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <SidebarContentSkeleton />
        ) : (
          <NavMain groups={filteredGroups} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
