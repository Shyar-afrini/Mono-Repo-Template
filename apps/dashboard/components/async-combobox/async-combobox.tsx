"use client";

import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2, Search } from "lucide-react";

import {
  Button,
  Container,
  Flex,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";

import { AsyncComboBoxList } from "./async-combobox-list";
import { useDebouncedValue } from "./use-debounced-value";
import type { AsyncComboBoxMessages, AsyncComboBoxProps } from "./types";
import { useAsyncComboBoxMessages } from "./use-async-combobox-messages";
import { useAsyncComboBoxLayout } from "./use-async-combobox-layout";

const DEFAULT_MENU_MAX_HEIGHT_CLASSNAME = "max-h-[320px]";

export function AsyncComboBox<T>({
  containerClassName = "w-full",
  label,
  required,
  disabled,
  valueId,
  selectedDisplayLabel,
  onValueChange,
  onSelectItem,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  queryKey,
  fetchPage,
  limit = 20,
  debounceMs = 350,
  minWidth = 280,
  maxMenuHeightClassName = DEFAULT_MENU_MAX_HEIGHT_CLASSNAME,
  getItemId,
  getItemLabel,
  renderItem,
  messages,
  renderTrigger,
}: AsyncComboBoxProps<T>) {
  const i18n: AsyncComboBoxMessages = useAsyncComboBoxMessages({
    emptyMessage,
    messages,
  });

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebouncedValue(search, debounceMs);

  const { triggerRef, listViewportRef, popoverStyle } = useAsyncComboBoxLayout({
    minWidth,
  });

  React.useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const query = useInfiniteQuery({
    queryKey: [...queryKey, { q: debouncedSearch, limit }],
    queryFn: async ({ pageParam }) =>
      fetchPage({
        q: debouncedSearch,
        page: Number(pageParam ?? 1),
        limit,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage?.hasMore ? Number(lastPageParam ?? 1) + 1 : undefined,
    enabled: open && !disabled,
    staleTime: 60 * 1000,
  });

  const items = React.useMemo(
    () => query.data?.pages.flatMap((page) => page.items ?? []) ?? [],
    [query.data]
  );

  const selectedItem = React.useMemo(() => {
    if (!valueId) return null;
    return items.find((it) => getItemId(it) === valueId) ?? null;
  }, [getItemId, items, valueId]);

  const lastPageItemsCount = React.useMemo(() => {
    const pages = query.data?.pages ?? [];
    const lastPage = pages.length > 0 ? pages[pages.length - 1] : undefined;
    return lastPage?.items?.length ?? 0;
  }, [query.data]);

  const triggerLabel = (() => {
    if (!valueId) return null;
    if (selectedItem) return getItemLabel(selectedItem);
    if (selectedDisplayLabel) return selectedDisplayLabel;
    return null;
  })();

  const showTriggerLoading =
    open && query.isPending && !query.isError && items.length === 0;

  const handleSelect = (item: T) => {
    const nextId = getItemId(item);
    const nextLabel = getItemLabel(item);

    // Close first to avoid popover/unmount timing glitches.
    setOpen(false);
    requestAnimationFrame(() => {
      if (onSelectItem) onSelectItem(item);
      onValueChange({ id: nextId, label: nextLabel });
    });
  };

  const searchInputPlaceholder = searchPlaceholder ?? placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Flex direction="col" gap={2} className={cn(containerClassName)}>
        {label ? (
          <Label htmlFor={label} className="text-sm font-medium">
            {label}
            {required ? (
              <Text small className="text-destructive ms-1">
                *
              </Text>
            ) : null}
          </Label>
        ) : null}

        <PopoverTrigger asChild>
          {renderTrigger ? (
            (renderTrigger({
              open,
              disabled,
              valueId,
              triggerLabel,
              placeholder,
              showTriggerLoading,
            }) as any)
          ) : (
            <Button
              ref={triggerRef}
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className={cn(
                "w-full justify-between gap-2 font-normal h-10",
                "dark:bg-zinc-900 bg-zinc-50 border dark:border-zinc-800 border-zinc-200",
                !valueId && "text-muted-foreground"
              )}
            >
              {showTriggerLoading ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin opacity-70" />
              ) : null}
              <Text className="truncate text-start flex-1 min-w-0">
                {triggerLabel ?? placeholder}
              </Text>
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          )}
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={6}
          className={cn(
            "p-0 overflow-hidden rounded-md",
            "dark:bg-zinc-900 bg-zinc-50 border dark:border-zinc-800 border-zinc-200 shadow-md"
          )}
          style={popoverStyle}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Flex direction="col" className="w-full">
            {/* Floating search header */}
            <Container
              className={cn(
                "sticky top-0 z-10",
                "dark:bg-zinc-900 bg-zinc-50",
                "border-b dark:border-zinc-800 border-zinc-200"
              )}
            >
              <Flex direction="col" gap={2} className="px-2 py-2">
                <Container className="relative">
                  <Search className="h-4 w-4 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-80 pointer-events-none" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={searchInputPlaceholder}
                    className={cn(
                      "h-10 ps-9",
                      "rounded-md",
                      // lighter than menu background
                      "dark:bg-zinc-800 bg-zinc-100/70",
                      // no border by default, only on focus/active
                      "border border-transparent",
                      "focus-visible:border-zinc-300 dark:focus-visible:border-zinc-700",
                      "focus-visible:ring-0"
                    )}
                  />
                </Container>

                {open && query.isFetching && items.length > 0 ? (
                  <Flex direction="row" align="center" gap={2} className="px-1">
                    <Loader2 className="h-3 w-3 animate-spin opacity-70" />
                    <Text className="text-xs text-muted-foreground">{i18n.loading}</Text>
                  </Flex>
                ) : null}
              </Flex>
            </Container>

            <AsyncComboBoxList
              listViewportRef={listViewportRef}
              maxMenuHeightClassName={maxMenuHeightClassName}
              i18n={i18n}
              isError={query.isError}
              isPending={query.isPending}
              isFetchingNextPage={query.isFetchingNextPage}
              fetchNextPage={() => query.fetchNextPage()}
              hasNextPage={Boolean(query.hasNextPage)}
              lastPageItemsCount={lastPageItemsCount}
              limit={limit}
              items={items}
              valueId={valueId}
              getItemId={getItemId}
              getItemLabel={getItemLabel}
              renderItem={renderItem}
              onSelect={handleSelect}
            />
          </Flex>
        </PopoverContent>
      </Flex>
    </Popover>
  );
}

