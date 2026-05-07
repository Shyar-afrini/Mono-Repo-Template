"use client";

import { useSidebarVariant } from "@/contexts/sidebar-variant-context";
import AppSidebar from "./sidebar";

interface SidebarWrapperProps {
  side: "left" | "right";
}

const SidebarWrapper = ({ side }: SidebarWrapperProps) => {
  const { variant } = useSidebarVariant();

  return <AppSidebar variant={variant} side={side} />;
};

export default SidebarWrapper;
