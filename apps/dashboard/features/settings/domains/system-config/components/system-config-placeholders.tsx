"use client";

import { Container, Flex, LocalizedText, Skeleton } from "@mono-repo-template/ui";
import { AlertTriangleIcon, FolderArchive } from "lucide-react";
import { useTranslations } from "next-intl";

export const SystemConfigFetchErrorPlaceHolder = () => {
  const t = useTranslations("settings.tabs.systemConfig");
  return (
    <Flex
      direction="row"
      align="center"
      justify="center"
      gap={2}
      className="w-full min-w-full h-full min-h-fit select-none p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
    >
      <AlertTriangleIcon size={20} className="text-red-500" />
      <Container className="">
        <LocalizedText
          className="text-red-500 text-sm"
          text={t("placeholders.error")}
        />
      </Container>
    </Flex>
  );
};

export const SystemConfigLoadingSkeleton = () => {
  return (
    <Flex direction="col" gap={4}>
      {Array.from({ length: 3 }).map((_, index) => {
        return (
          <Flex
            key={index}
            direction="row"
            align="center"
            justify="between"
            gap={4}
            className="w-full min-w-full h-full min-h-fit select-none p-4 bg-secondary/40 border border-secondary/10 rounded-lg"
          >
            <Flex direction="col" gap={2} className="flex-1">
              <Skeleton className="w-48 h-5 bg-card-foreground/5 rounded-md" />
              <Skeleton className="w-64 h-4 bg-card-foreground/5 rounded-md" />
            </Flex>
            <Skeleton className="w-11 h-6 bg-card-foreground/5 rounded-full" />
          </Flex>
        );
      })}
    </Flex>
  );
};

export const SystemConfigEmptyDataPlaceHolder = () => {
  const t = useTranslations("settings.tabs.systemConfig");
  return (
    <Flex
      direction="row"
      align="center"
      justify="center"
      gap={2}
      className="w-full min-w-full h-full min-h-fit select-none p-3 bg-secondary/40 border border-secondary/10 rounded-lg"
    >
      <FolderArchive size={20} className="text-muted-foreground" />
      <LocalizedText
        className="text-muted-foreground text-sm"
        text={t("placeholders.empty")}
      />
    </Flex>
  );
};
