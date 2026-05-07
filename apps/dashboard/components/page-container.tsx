import { ScrollArea, ScrollBar } from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";
import React from "react";

const PageContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <ScrollArea className={cn("max-h-[calc(100svh-40px)]", className)}>
      {children}
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};

export default PageContainer;
