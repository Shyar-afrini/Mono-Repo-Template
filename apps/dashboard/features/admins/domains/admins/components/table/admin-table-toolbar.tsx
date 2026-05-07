"use client";

import type { Table as TanstackTable } from "@tanstack/react-table";
import { Admin } from "@mono-repo-template/types";
import {
  AnimatedButton,
  Container,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Flex,
  Input,
  LocalizedText,
} from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";
import { ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";

type AdminTableToolbarProps = {
  table: TanstackTable<Admin>;
  searchValue: string;
  searchError: string | null;
  onSearchChange: (value: string) => void;
};

export function AdminTableToolbar({
  table,
  searchValue,
  searchError,
  onSearchChange,
}: Readonly<AdminTableToolbarProps>) {
  const t = useTranslations("admins");

  return (
    <Container>
      <Flex direction="row" justify="between" gap={2}>
        <Flex direction="column" gap={1} className="w-full">
          <Container className="relative w-1/3 ms-1">
            <Search
              className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder={t("search.placeholder")}
              className={cn(
                "ps-9 py-2.5 h-auto",
                searchError &&
                "border-destructive focus-visible:ring-destructive"
              )}
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </Container>
          {searchError ? (
            <LocalizedText
              className="mt-1 text-xs text-destructive"
              text={searchError}
            />
          ) : null}
        </Flex>
        <Container>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <AnimatedButton
                variant="outline"
                className="ms-auto p-2 h-auto"
                size="sm"
              >
                <LocalizedText text={t("table.columns.columns")} />
                <ChevronDown className="ms-2" size={16} />
              </AnimatedButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="p-2 md:min-w-[250px] w-auto"
            >
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize py-3"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {t(`table.columns.${column.id}` as any)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </Container>
      </Flex>
    </Container>
  );
}
