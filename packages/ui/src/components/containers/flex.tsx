import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

// Predefined mappings to avoid dynamic class generation
const flexDirectionMap = {
  row: "flex-row",
  col: "flex-col",
  column: "flex-col", // alias for col
  "row-reverse": "flex-row-reverse",
  "col-reverse": "flex-col-reverse",
} as const;

const gapMap = {
  0: "gap-0",
  0.5: "gap-0.5",
  1: "gap-1",
  1.5: "gap-1.5",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  7: "gap-7",
  8: "gap-8",
  9: "gap-9",
  10: "gap-10",
  11: "gap-11",
  12: "gap-12",
  14: "gap-14",
  16: "gap-16",
  20: "gap-20",
  24: "gap-24",
  28: "gap-28",
  32: "gap-32",
  36: "gap-36",
  40: "gap-40",
  44: "gap-44",
  48: "gap-48",
  52: "gap-52",
  56: "gap-56",
  60: "gap-60",
  64: "gap-64",
  72: "gap-72",
  80: "gap-80",
  96: "gap-96",
} as const;

const itemsAlignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
} as const;

const justifyMap = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
} as const;

interface FlexProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  className?: string;
  gap?: keyof typeof gapMap;
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  children?: React.ReactNode;
  direction?: keyof typeof flexDirectionMap;
}

const Flex = forwardRef<HTMLDivElement, FlexProps>(
  ({ className, gap, align, justify, children, direction, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex",
          direction && flexDirectionMap[direction],
          gap !== undefined && gapMap[gap],
          align && itemsAlignMap[align],
          justify && justifyMap[justify],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Flex.displayName = "Flex";
export default Flex;
