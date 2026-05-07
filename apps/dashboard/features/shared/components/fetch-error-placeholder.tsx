import { cn, Flex, Text } from "@mono-repo-template/ui";
import React, { forwardRef, HTMLAttributes } from "react";
import DangerTriangle from "@/public/assets/icons/danger-triangle.svg";
import Image from "next/image";

interface FetchErrorPlaceholderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}

const FetchErrorHandler = forwardRef<
  HTMLDivElement,
  FetchErrorPlaceholderProps
>(({ title, description, children, className, ...props }, ref) => {
  return (
    <Flex
      ref={ref}
      {...props}
      direction="column"
      align="center"
      justify="center"
      className={cn("w-full h-full min-h-[250px]", className)}
    >
      <Image
        src={DangerTriangle}
        alt="danger-triangle"
        className="size-[100px]"
      />
      <Flex direction="col" gap={1} align="center">
        <Text className="text-destructive">{title}</Text>
        <Text small className="dark:text-zinc-400 text-zinc-600">
          {description}
        </Text>
      </Flex>
      {children}
    </Flex>
  );
});

FetchErrorHandler.displayName = "FetchErrorPlaceholder";

export default FetchErrorHandler;
