"use client";

import React, { useEffect, useRef } from "react";
import { Container } from "../containers";
import { Flex } from "../containers";
import { LocalizedText } from "../typography";
import { cn } from "../../lib/utils";

export interface InfiniteScrollHandlerProps {
  /**
   * Whether there are more pages to fetch
   */
  hasNextPage: boolean;
  /**
   * Whether we've reached the end of the data
   */
  hasReachedEnd: boolean;
  /**
   * Whether a fetch is currently in progress
   */
  isFetchingNextPage: boolean;
  /**
   * Whether initial data is loading
   */
  isPending: boolean;
  /**
   * Function to fetch the next page
   */
  fetchNextPage: () => void | Promise<unknown>;
  /**
   * Loading message to display while fetching next page
   */
  loadingMessage?: string;
  /**
   * Custom loading component
   */
  customLoadingComponent?: React.ReactNode;
  /**
   * Threshold for intersection observer (0-1)
   * @default 0.1
   */
  threshold?: number;
  /**
   * Delay in ms before allowing next fetch
   * @default 1000
   */
  fetchDelay?: number;
  /**
   * Additional className for the observer target
   */
  className?: string;
  /**
   * Children to render
   */
  children: React.ReactNode;
}

/**
 * Reusable infinite scroll component that fetches more data when user scrolls near the bottom
 */
const InfiniteScrollHandler = ({
  hasNextPage,
  hasReachedEnd,
  isFetchingNextPage,
  isPending,
  fetchNextPage,
  loadingMessage,
  customLoadingComponent,
  threshold = 0.1,
  fetchDelay = 1000,
  className,
  children,
}: InfiniteScrollHandlerProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    // Don't set up observer if there are no more pages or we've reached the end
    if (!hasNextPage || hasReachedEnd || isPending) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Additional safety checks before fetching
        if (
          entries[0]?.isIntersecting &&
          hasNextPage &&
          !hasReachedEnd &&
          !isFetchingNextPage &&
          !isPending &&
          !isLoadingRef.current
        ) {
          isLoadingRef.current = true;
          const fetchPromise = fetchNextPage();
          if (fetchPromise && typeof (fetchPromise as Promise<unknown>).then === "function") {
            (fetchPromise as Promise<unknown>).finally(() => {
              // Add a delay before allowing next fetch
              setTimeout(() => {
                isLoadingRef.current = false;
              }, fetchDelay);
            });
          } else {
            // If fetchNextPage doesn't return a promise, just set timeout
            setTimeout(() => {
              isLoadingRef.current = false;
            }, fetchDelay);
          }
        }
      },
      { threshold }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
    // Intentionally omitting fetchNextPage from dependencies to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNextPage, hasReachedEnd, isFetchingNextPage, isPending, threshold, fetchDelay]);

  return (
    <>
      {children}
      {hasNextPage && !hasReachedEnd && (
        <Container ref={observerTarget} className={cn("h-10 w-full", className)} />
      )}
      {isFetchingNextPage && (
        <Flex justify="center" align="center" className="py-4">
          {customLoadingComponent || (
            <LocalizedText
              text={loadingMessage || "Loading more..."}
              className="text-sm text-muted-foreground"
            />
          )}
        </Flex>
      )}
    </>
  );
};

export default InfiniteScrollHandler;
