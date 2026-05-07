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

export const PermissionsErrorComponent = () => {
  const t = useTranslations("roles.assignPermissions.dialog");
  return (
    <Flex
      direction="row"
      align="center"
      justify="center"
      gap={2}
      className="w-full min-w-full h-full min-h-[200px] select-none"
    >
      <AlertTriangleIcon
        size={20}
        className="text-red-500 border dark:border-red-500/20 border-red-500/30 dark:bg-red-500/5 bg-red-500/10 p-3 rounded-lg min-h-10 h-full w-auto"
      />
      <Container className="p-3 dark:bg-red-500/5 bg-red-500/10 border dark:border-red-500/20 border-red-500/30 rounded-lg">
        <LocalizedText className="text-red-500 text-sm" text={t("error")} />
      </Container>
    </Flex>
  );
};

export const PermissionsSkeletonLoader = () => {
  return (
    <Flex direction="column" gap={4} className="w-full">
      {Array.from({ length: 5 }).map((_, groupIndex) => (
        <Flex
          key={`skeleton-group-${groupIndex}`}
          direction="column"
          gap={3}
          className="w-full"
        >
          <Skeleton className="h-5 w-32 rounded-md" />
          <Grid
            cols={3}
            gap={4}
            className="w-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <Flex
                key={`skeleton-permission-${groupIndex}-${index}`}
                direction="row"
                align="center"
                justify="start"
                gap={2}
                className="w-full p-3 dark:bg-zinc-900 bg-zinc-200 rounded-lg"
              >
                <Skeleton className="size-5 rounded dark:bg-zinc-800 bg-zinc-300" />
                <Flex direction="column" gap={1} className="flex-1">
                  <Skeleton className="h-4 w-24 rounded-md dark:bg-zinc-800 bg-zinc-300" />
                  <Skeleton className="h-3 w-32 rounded-md dark:bg-zinc-800 bg-zinc-300" />
                </Flex>
              </Flex>
            ))}
          </Grid>
        </Flex>
      ))}
    </Flex>
  );
};

export const PermissionsEmptyDataComponent = () => {
  const t = useTranslations("roles.assignPermissions.dialog");
  return (
    <Flex
      direction="row"
      align="center"
      justify="center"
      gap={2}
      className="w-full min-w-full h-full min-h-[200px] select-none"
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
