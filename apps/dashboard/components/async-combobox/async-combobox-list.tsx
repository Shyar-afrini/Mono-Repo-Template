"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { Button, Container, Flex, Text } from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";

import { InfiniteScrollSentinel } from "./infinite-scroll-sentinel";
import {
  AsyncComboBoxEmptyState,
  AsyncComboBoxErrorState,
  AsyncComboBoxLoadingSkeleton,
} from "./states";
import type { AsyncComboBoxMessages } from "./types";

export function AsyncComboBoxList<T>({
  listViewportRef,
  maxMenuHeightClassName,
  i18n,
  isError,
  isPending,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage,
  lastPageItemsCount,
  limit,
  items,
  valueId,
  getItemId,
  getItemLabel,
  renderItem,
  onSelect,
}: Readonly<{
  listViewportRef: React.RefObject<HTMLDivElement | null>;
  maxMenuHeightClassName: string;
  i18n: AsyncComboBoxMessages;

  isError: boolean;
  isPending: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  lastPageItemsCount: number;
  limit: number;

  items: T[];
  valueId: string;
  getItemId: (item: T) => string;
  getItemLabel: (item: T) => string;
  renderItem?: (item: T, state: { selected: boolean }) => React.ReactNode;
  onSelect: (item: T) => void;
}>) {
  const shouldShowInfiniteScrollIndicator =
    hasNextPage && lastPageItemsCount >= limit;

  const showEmpty = !isError && !isPending && items.length === 0;

  return (
    <Container
      ref={listViewportRef}
      className={cn(
        // fit content, but don't exceed the max height
        "h-auto overflow-auto",
        maxMenuHeightClassName,
        "pb-3",
        // prevent the parent (Sheet/Page) from stealing the wheel scroll
        "overscroll-contain"
      )}
      onWheel={(event) => event.stopPropagation()}
      tabIndex={0}
    >
      {isError ? <AsyncComboBoxErrorState label={i18n.error} /> : null}

      {!isError && isPending ? <AsyncComboBoxLoadingSkeleton /> : null}

      {showEmpty ? <AsyncComboBoxEmptyState label={i18n.empty} /> : null}

      {!isError && !isPending
        ? items.map((item) => {
          const itemId = getItemId(item);
          const isSelected = itemId === valueId;

          return (
            <Button
              key={itemId}
              type="button"
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto py-3 px-3 rounded-none",
                "hover:bg-muted/60"
              )}
              onClick={() => onSelect(item)}
            >
              {isSelected ? <Check className="h-4 w-4 me-2 shrink-0" /> : null}
              <Flex direction="col" align="start" className="min-w-0 flex-1">
                {renderItem ? (
                  renderItem(item, { selected: isSelected })
                ) : (
                  <Text className="text-sm truncate text-start w-full">
                    {getItemLabel(item)}
                  </Text>
                )}
              </Flex>
            </Button>
          );
        })
        : null}

      {shouldShowInfiniteScrollIndicator ? (
        <InfiniteScrollSentinel
          enabled={shouldShowInfiniteScrollIndicator}
          isFetching={isFetchingNextPage}
          fetchNext={fetchNextPage}
          scrollAreaRef={listViewportRef}
          loadingMoreLabel={i18n.loadingMore}
        />
      ) : null}
    </Container>
  );
}

