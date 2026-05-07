import DashboardLayoutWrapper from "@/components/navigation/dashboard-layout-wrapper";
import React from "react";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
};

export default DashboardLayout;
