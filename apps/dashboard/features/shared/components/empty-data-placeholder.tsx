import { cn, Container, Flex, Text } from "@mono-repo-template/ui";
import React, { forwardRef, HTMLAttributes } from "react";
import DangerTriangle from "@/public/assets/icons/danger-triangle.svg";
import Image from "next/image";
import { FolderArchive } from "lucide-react";

interface FetchErrorPlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

const EmptyDataPlaceholder = forwardRef<
  HTMLDivElement,
  FetchErrorPlaceholderProps
>(({ title, description, children, className, ...props }, ref) => {
  return (
    <Flex
      direction="col"
      gap={2}
      align="center"
      justify="center"
      className="w-full h-full min-h-[250px]"
    >
      <Container className="p-4 dark:bg-zinc-800 bg-zinc-200 rounded-lg max-h-fit">
        <FolderArchive size={20} className="dark:text-zinc-50 text-zinc-900" />
      </Container>
      <Flex direction="col" gap={1} align="center">
        <Text className="dark:text-zinc-50 text-zinc-900">{title}</Text>
        <Text small className="dark:text-zinc-400 text-zinc-600">
          {description}
        </Text>
      </Flex>
      {children}
    </Flex>
  );
});

EmptyDataPlaceholder.displayName = "EmptyDataPlaceholder";

export default EmptyDataPlaceholder;
