import { flexRender, Table } from "@tanstack/react-table";
import {
  Container,
  TableHead,
  TableHeader,
  TableRow,
} from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import React from "react";

const TableHeaderRenderer = <TData,>({
  table,
  customHeader,
}: {
  table: Table<TData>;
  customHeader?: React.ReactNode;
}) => {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead
              style={{ width: `${header.getSize()}px` }}
              key={header.id}
              className="relative max-w-fit whitespace-nowrap sticky top-0 z-10 bg-background"
            >
              <Container
                onClick={
                  header.column.getCanSort()
                    ? header.column.getToggleSortingHandler()
                    : undefined
                }
                className={cn(
                  "flex items-center gap-2  rounded-md p-2 px-3 max-w-fit whitespace-nowrap",
                  header.column.getIsSorted() && "bg-muted",
                  header.column.getCanSort() && "cursor-pointer hover:bg-muted"
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
                    if (sortState === "asc") return <ArrowDown size={16} />;
                    if (sortState === "desc") return <ArrowUp size={16} />;
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
          <Container className="max-w-fit">{customHeader}</Container>
        </TableRow>
      ))}
    </TableHeader>
  );
};

export default TableHeaderRenderer;
