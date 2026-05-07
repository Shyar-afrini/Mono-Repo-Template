"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Tag, icons, type LucideProps } from "lucide-react";
import {
  Button,
  Flex,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Text,
} from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";
import { IconGrid, type IconCategory } from "./icon-grid";

function DynamicIcon({
  name,
  ...props
}: { name?: string | null } & LucideProps) {
  const Icon =
    name && name in icons
      ? (icons as Record<string, React.FC<LucideProps>>)[name]
      : Tag;
  return <Icon {...props} />;
}

export type IconPickerProps = {
  label: string;
  placeholder: string;
  categories: IconCategory[];
  value: string;
  onChange: (next: string) => void;
  error?: string;
};

export const IconPicker = ({
  label,
  placeholder,
  categories,
  value,
  onChange,
  error,
}: IconPickerProps) => {
  const [open, setOpen] = useState(false);

  const resolvedCategories = categories
    .map((c) => ({
      ...c,
      icons: c.icons.filter((name) => name in icons),
    }))
    .filter((c) => c.icons.length > 0);

  return (
    <Flex direction="col" gap={1} className="w-full">
      <Text span className="text-sm font-medium text-foreground dark:text-zinc-200">
        {label}
      </Text>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-between p-3 h-auto rounded-xl bg-transparent",
              error && "border-red-500/50"
            )}
          >
            <Flex align="center" gap={2} className="min-w-0">
              <Flex
                align="center"
                justify="center"
                className="size-9 rounded-lg bg-secondary/50 dark:bg-zinc-800/50 border border-border dark:border-zinc-700 shrink-0"
              >
                {value ? (
                  <DynamicIcon
                    name={value}
                    className="size-5 text-foreground dark:text-zinc-200"
                  />
                ) : null}
              </Flex>
              <Text
                span
                className="text-sm text-muted-foreground dark:text-zinc-400 truncate"
              >
                {value || placeholder}
              </Text>
            </Flex>
            <ChevronDown className="size-4 text-muted-foreground dark:text-zinc-500 shrink-0" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-[360px] max-w-[calc(100vw-2rem)] p-4 rounded-2xl"
          align="start"
        >
          <ScrollArea
            className="h-[360px]"
            onWheelCapture={(e) => {
              // Prevent wheel events from being intercepted by parent scroll areas
              e.stopPropagation();
            }}
          >
            <IconGrid
              categories={resolvedCategories}
              value={value}
              onChange={(next) => {
                onChange(next);
                setOpen(false);
              }}
            />
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {error ? (
        <Text span className="text-xs text-red-500">
          {error}
        </Text>
      ) : null}
    </Flex>
  );
};

