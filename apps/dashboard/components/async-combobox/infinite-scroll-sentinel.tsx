"use client";

import * as React from "react";

import { Container, Flex, Text } from "@mono-repo-template/ui";

export function InfiniteScrollSentinel({
  enabled,
  isFetching,
  fetchNext,
  scrollAreaRef,
  loadingMoreLabel,
}: Readonly<{
  enabled: boolean;
  isFetching: boolean;
  fetchNext: () => void;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  loadingMoreLabel: string;
}>) {
  const targetRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!enabled || isFetching) return;

    const rootEl = scrollAreaRef.current as HTMLElement | null;
    if (!rootEl || !targetRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNext();
      },
      { root: rootEl, threshold: 0.1, rootMargin: "120px" }
    );

    observer.observe(targetRef.current);
    return () => observer.disconnect();
  }, [enabled, fetchNext, isFetching, scrollAreaRef]);

  return (
    <Container ref={targetRef} className="px-3 py-2">
      <Flex direction="row" align="center">
        {enabled && isFetching ? (
          <Text className="text-xs text-muted-foreground">{loadingMoreLabel}</Text>
        ) : null}
      </Flex>
    </Container>
  );
}

