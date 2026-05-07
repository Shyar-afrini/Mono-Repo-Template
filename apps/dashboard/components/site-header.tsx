"use client";
import {
  Flex,
  Separator,
  SidebarTrigger,
  Text,
  Title,
  useSidebar,
} from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";
import { motion } from "motion/react";
interface SiteHeaderProps {
  pageTitle: string;
  pageDescription?: string;
  children?: React.ReactNode;
  className?: string;
}

const SiteHeader = ({
  pageTitle,
  pageDescription,
  children,
  className,
}: SiteHeaderProps) => {
  const { open: isSidebarOpen } = useSidebar();

  return (
    <motion.header
      className={cn(
        "flex flex-wrap space-y-2 xl:flex-row items-start justify-between gap-2 sm:gap-2 min-w-full sticky top-0 bg-background z-10 py-2 transition-[max-width] duration-200 ease-linear",
        isSidebarOpen
          ? "max-w-[calc(100vw-var(--sidebar-width)-2rem)]"
          : "max-w-[calc(100vw-2rem)]",
        className
      )}
    >
      <Flex align="center" gap={1} className="w-full sm:w-auto">
        <SidebarTrigger className="p-3 h-auto w-auto shrink-0" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 hidden sm:block"
        />
        <Flex
          gap={0}
          direction="col"
          align="start"
          justify="start"
          className="min-w-0 flex-1 w-full"
        >
          <Title level={1} className="text-base xl:text-lg font-medium">
            {pageTitle}
          </Title>
          {pageDescription && (
            <Text className="text-xs xl:text-sm text-muted-foreground">
              {pageDescription}
            </Text>
          )}
        </Flex>
      </Flex>
      {children && (
        <Flex className="w-full sm:w-auto mt-2 sm:mt-0 self-start lg:self-end">{children}</Flex>
      )}
    </motion.header>
  );
};

export default SiteHeader;
