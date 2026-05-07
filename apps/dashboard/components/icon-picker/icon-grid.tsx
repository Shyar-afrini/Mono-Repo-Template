"use client";

import { Flex, Text } from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";
import { Tag, icons, type LucideProps } from "lucide-react";

export interface IconCategory {
  label: string;
  icons: string[];
}

function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon =
    name && name in icons
      ? (icons as Record<string, React.FC<LucideProps>>)[name]
      : Tag;
  return <Icon {...props} />;
}

export type IconGridProps = {
  categories: IconCategory[];
  value: string;
  onChange: (next: string) => void;
};

export const IconGrid = ({ categories, value, onChange }: IconGridProps) => {
  return (
    <Flex direction="col" gap={4} className="w-full">
      {categories.map((category) => (
        <Flex key={category.label} direction="col" gap={3}>
          <Text
            span
            className="text-xs font-medium tracking-[-0.2px] text-muted-foreground dark:text-zinc-500"
          >
            {category.label}
          </Text>

          <Flex className="flex-wrap gap-2" align="start">
            {category.icons.map((iconName) => {
              const selected = iconName === value;
              return (
                <Flex
                  key={iconName}
                  align="center"
                  justify="center"
                  className={cn(
                    "p-2 rounded-lg border cursor-pointer transition-colors",
                    "bg-secondary/40 dark:bg-zinc-800/40 border-border dark:border-zinc-700",
                    "hover:bg-secondary/70 dark:hover:bg-zinc-800/70",
                    selected &&
                    "ring-2 ring-emerald-500/60 border-emerald-500/40"
                  )}
                  onClick={() => onChange(iconName)}
                  aria-label={iconName}
                >
                  <DynamicIcon
                    name={iconName}
                    className="size-5 text-foreground dark:text-zinc-200"
                  />
                </Flex>
              );
            })}
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
};

