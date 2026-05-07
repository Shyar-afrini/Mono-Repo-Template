"use client";

import * as React from "react";

import { Container, Flex, Skeleton, Text } from "@mono-repo-template/ui";

export function AsyncComboBoxLoadingSkeleton({
  rows = 6,
}: Readonly<{
  rows?: number;
}>) {
  return (
    <Flex direction="col" gap={2} className="px-2 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Container
          key={`async-combobox-skel-${i}`}
          className="flex items-center gap-2 px-3 py-2 rounded-md"
        >
          <Skeleton className="h-4 w-4 rounded-sm shrink-0" />
          <Skeleton className="h-4 w-full rounded-md" />
        </Container>
      ))}
    </Flex>
  );
}

export function AsyncComboBoxEmptyState({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <Flex direction="col" align="center" justify="center" className="px-3 py-10">
      <Text className="text-sm text-muted-foreground text-center">{label}</Text>
    </Flex>
  );
}

export function AsyncComboBoxErrorState({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <Flex direction="col" align="center" justify="center" className="px-3 py-10">
      <Text className="text-sm text-destructive text-center">{label}</Text>
    </Flex>
  );
}

