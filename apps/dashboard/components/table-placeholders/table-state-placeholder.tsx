"use client";

import * as React from "react";

import { Container, Flex, Text } from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";

export type TableStatePlaceholderProps = {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ReactNode;
  /** Icon wrapper styling. */
  readonly iconContainerClassName?: string;
  /** Title styling. */
  readonly titleClassName?: string;
  /** Description styling. */
  readonly descriptionClassName?: string;
  readonly className?: string;
};

export function TableStatePlaceholder({
  title,
  description,
  icon,
  iconContainerClassName,
  titleClassName,
  descriptionClassName,
  className,
}: Readonly<TableStatePlaceholderProps>) {
  return (
    <Flex
      direction="col"
      gap={2}
      align="center"
      justify="center"
      className={cn("w-full h-full min-h-[250px]", className)}
    >
      <Container
        className={cn(
          "p-4 rounded-lg max-h-fit",
          "dark:bg-zinc-800 bg-zinc-200",
          iconContainerClassName
        )}
      >
        {icon}
      </Container>

      <Flex direction="col" gap={1} align="center">
        <Text className={cn("text-zinc-900 dark:text-zinc-100", titleClassName)}>
          {title}
        </Text>
        <Text
          small
          className={cn("text-muted-foreground", descriptionClassName)}
        >
          {description}
        </Text>
      </Flex>
    </Flex>
  );
}

