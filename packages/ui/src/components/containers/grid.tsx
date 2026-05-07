import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

// Predefined mapping to avoid dynamic class generation
const gridColsMap = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6",
  7: "grid-cols-7",
  8: "grid-cols-8",
  9: "grid-cols-9",
  10: "grid-cols-10",
  11: "grid-cols-11",
  12: "grid-cols-12",
} as const;

const gridRowsMap = {
  1: "grid-rows-1",
  2: "grid-rows-2",
  3: "grid-rows-3",
  4: "grid-rows-4",
  5: "grid-rows-5",
  6: "grid-rows-6",
  7: "grid-rows-7",
  8: "grid-rows-8",
  9: "grid-rows-9",
  10: "grid-rows-10",
  11: "grid-rows-11",
  12: "grid-rows-12",
};

const itemsAlignMap = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
} as const;

const justifyItemsMap = {
  start: "justify-items-start",
  center: "justify-items-center",
  end: "justify-items-end",
  between: "justify-items-between",
  around: "justify-items-around",
  evenly: "justify-items-evenly",
} as const;

interface GridProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  className?: string;
  gap?: number;
  align?: "start" | "center" | "end";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  children?: React.ReactNode;
  cols?: keyof typeof gridColsMap;
  rows?: keyof typeof gridRowsMap;
}

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, gap, align, justify, children, cols, rows, ...props }, ref) => {
    return (
      <div
        className={cn(
          "grid",
          align && itemsAlignMap[align],
          justify && justifyItemsMap[justify],
          cols && gridColsMap[cols],
          rows && gridRowsMap[rows],
          gap !== undefined && `gap-${gap}`,
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

Grid.displayName = "Grid";
export default Grid;
