"use client";
import {
  Container,
  Flex,
  Grid,
  LocalizedText,
  Skeleton,
} from "@mono-repo-template/ui";
import { AlertCircleIcon, AlertTriangleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export const RolesErrorComponent = () => {
  return (
    <Flex
      direction="row"
      align="center"
      justify="center"
      gap={2}
      className="w-full min-w-full h-full min-h-[70svh] select-none"
    >
      <AlertTriangleIcon
        size={20}
        className="text-red-500 border dark:border-red-500/20 border-red-500/30 dark:bg-red-500/5 bg-red-500/10 p-3 rounded-lg min-h-10 h-full w-auto"
      />
      <Container className="p-3 dark:bg-red-500/5 bg-red-500/10 border dark:border-red-500/20 border-red-500/30 rounded-lg">
        <LocalizedText
          className="text-red-500 text-sm"
          text={"roles.list.error"}
        />
      </Container>
    </Flex>
  );
};

export const RolesLoadingSkeleton = () => {
  return (
    <Grid
      cols={4}
      gap={4}
      className="w-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <Flex
          key={index}
          direction="column"
          gap={3}
          className="w-full h-full relative bg-card p-4 rounded-2xl transition-colors"
        >
          {/* Header with Unit Number and Options */}
          <Flex direction="row" align="center" justify="between">
            <Flex direction="row" align="center" gap={2}>
              <Skeleton className="size-12 rounded-lg" />
              <Flex direction="column" gap={1} align="start" justify="start">
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </Flex>
            </Flex>
            <Skeleton className="size-10 rounded-lg" />
          </Flex>
        </Flex>
      ))}
    </Grid>
  );
};

export const RolesEmptyDataComponent = () => {
  const t = useTranslations("roles.list");
  return (
    <Flex
      direction="row"
      align="center"
      justify="center"
      gap={2}
      className="w-full min-w-full h-full min-h-[70svh] select-none"
    >
        <Flex
          direction="row"
          align="center"
          gap={2}
          className="dark:bg-muted/30 bg-zinc-200/50 p-3 rounded-lg"
        >
          <AlertCircleIcon size={20} className="dark:text-card-foreground text-zinc-900" />
          <LocalizedText
            text={t("empty")}
            className="dark:text-card-foreground text-zinc-900 text-sm"
          />
        </Flex>
    </Flex>
  );
};
