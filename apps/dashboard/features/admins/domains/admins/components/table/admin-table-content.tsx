"use client";

import type { CSSProperties } from "react";
import type { Table as TanstackTable } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { AnimatePresence, motion, type Variants } from "motion/react";
import {
  Container,
  LocalizedText,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useSidebar,
} from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import TableLoadingDataPlaceholder from "@/features/shared/components/table-loading-data-placeholder";
import { TableEmptyPlaceholder, TableErrorPlaceholder } from "@/components/table-placeholders";
import type { AdminWithRole } from "../../types";
import AdminActionsPopover from "../actions/admin-actions-popover";

const LOADING_ROW_KEYS: readonly string[] = Array.from(
  { length: 8 },
  (_, index) => `admin-loading-row-${index}`
);

const MotionTableRow = motion(TableRow);
const MotionTableCell = motion(TableCell);

const rowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: (index: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.25,
      delay: index * 0.05,
      staggerChildren: 0.05,
    },
  }),
};

const cellVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
};

type AdminTableContentProps = {
  table: TanstackTable<AdminWithRole>;
  isPending: boolean;
  isError: boolean;
};

export function AdminTableContent({
  table,
  isPending,
  isError,
}: Readonly<AdminTableContentProps>) {
  const t = useTranslations("admins.table");
  const tPlaceholders = useTranslations("admins.table.placeholders");
  const visibleColumnCount = table
    .getAllColumns()
    .filter((column) => column.getIsVisible()).length;
  const totalColumnCount = visibleColumnCount + 1;

  let bodyContent;
  if (isError) {
    bodyContent = (
      <TableErrorPlaceholder
        visibleColumnCount={totalColumnCount}
        title={tPlaceholders("error.title")}
        description={tPlaceholders("error.description")}
      />
    );
  } else if (isPending) {
    bodyContent = (
      <TableLoadingDataPlaceholder
        table={table}
        loadingRowCount={LOADING_ROW_KEYS.length}
      />
    );
  } else if (table.getRowModel().rows.length === 0) {
    bodyContent = (
      <TableEmptyPlaceholder
        visibleColumnCount={totalColumnCount}
        title={tPlaceholders("empty.title")}
        description={tPlaceholders("empty.description")}
      />
    );
  } else {
    bodyContent = (
      <AnimatePresence initial={false}>
        {table.getRowModel().rows.map((row, index) => (
          <MotionTableRow
            key={row.id}
            className={cn(row.getIsSelected() && "bg-secondary/40")}
            variants={rowVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            custom={index}
          >
            {row.getVisibleCells().map((cell) => (
              <MotionTableCell
                key={cell.id}
                style={{
                  minWidth: `${cell.column.getSize()}px`,
                  maxWidth: `${cell.column.columnDef.maxSize ?? 500}px`,
                }}
                className="whitespace-nowrap"
                variants={cellVariants}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </MotionTableCell>
            ))}
            <MotionTableCell
              className="px-2"
              style={{ width: "1%" }}
              variants={cellVariants}
            >
              <AdminActionsPopover admin={row.original} />
            </MotionTableCell>
          </MotionTableRow>
        ))}
      </AnimatePresence>
    );
  }

  const { open: isSidebarOpen } = useSidebar();

  return (
    <Container className="rounded-md border">
      <Container
        className={cn(
          "w-full overflow-auto overscroll-contain transition-[max-width] duration-200 ease-linear",
          "max-h-[calc(100svh-360px)]",
          isSidebarOpen
            ? "max-w-[calc(100vw-var(--sidebar-width)-2rem)]"
            : "max-w-[calc(100vw-2rem)]"
        )}
      >
        <table className="w-full caption-bottom text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    style={{
                      minWidth: `${header.getSize()}px`,
                      maxWidth: `${header.column.columnDef.maxSize ?? 500}px`,
                    }}
                    key={header.id}
                    className="relative whitespace-nowrap sticky top-0 z-10 bg-background"
                  >
                    <Container
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                      className={cn(
                        "flex items-center gap-2 rounded-md p-2 px-3 max-w-fit whitespace-nowrap",
                        header.column.getIsSorted() && "bg-muted",
                        header.column.getCanSort() &&
                          "cursor-pointer hover:bg-muted"
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {header.column.columnDef.enableSorting &&
                        (() => {
                          const sortState = header.column.getIsSorted();
                          if (sortState === "asc")
                            return <ArrowDown size={16} />;
                          if (sortState === "desc")
                            return <ArrowUp size={16} />;
                          return <ArrowUpDown size={16} />;
                        })()}
                    </Container>
                    <Container
                      role="resizable"
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className="h-full w-[3px] absolute end-0 top-0 mx-3 bg-muted/40 cursor-col-resize"
                    />
                  </TableHead>
                ))}
                <TableHead className="px-2 whitespace-nowrap sticky top-0 z-10 bg-background">
                  <LocalizedText text={t("columns.actions")} />
                </TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{bodyContent}</TableBody>
        </table>
      </Container>
    </Container>
  );
}
