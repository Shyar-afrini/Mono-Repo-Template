"use client";

import { useIsRTL } from "@/hooks/use-direction";
import { cloneElement, isValidElement, type ReactElement } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactElement;
  className?: string;
};

export function FlipOnRTL({ children, className }: Props) {
  const isRTL = useIsRTL();

  if (!isValidElement(children)) {
    return children;
  }

  const props = children.props as { className?: string } & Record<
    string,
    unknown
  >;
  const existingClassName = props.className;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return cloneElement(children as any, {
    ...props,
    className: cn(
      existingClassName,
      isRTL && "scale-x-[-1]", // Tailwind's way to flip horizontally
      className
    ),
  });
}
