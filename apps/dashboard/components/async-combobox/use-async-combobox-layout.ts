"use client";

import * as React from "react";

export function useAsyncComboBoxLayout({
  minWidth,
}: Readonly<{
  minWidth: number;
}>) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listViewportRef = React.useRef<HTMLDivElement | null>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number>();

  React.useLayoutEffect(() => {
    if (!triggerRef.current) return;
    const update = () =>
      setTriggerWidth(triggerRef.current?.getBoundingClientRect().width);
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(triggerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const popoverStyle = React.useMemo(
    () => ({
      width: triggerWidth ? `${Math.max(triggerWidth, minWidth)}px` : undefined,
      minWidth: triggerWidth ? undefined : `${minWidth}px`,
    }),
    [minWidth, triggerWidth]
  );

  return {
    triggerRef,
    listViewportRef,
    popoverStyle,
  } as const;
}

