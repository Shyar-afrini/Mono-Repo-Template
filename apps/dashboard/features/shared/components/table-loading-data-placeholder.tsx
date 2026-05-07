import { Table as TanstackTable } from "@tanstack/react-table";
import { Skeleton, TableCell, TableRow } from "@mono-repo-template/ui";

const TableLoadingDataPlaceholder = <TData,>({
  table,
  loadingRowCount,
}: {
  table: TanstackTable<TData>;
  loadingRowCount: number;
}) => {
  return (
    <>
      {Array.from({ length: loadingRowCount }, (_, i) => (
        <TableRow key={`loading-row-${i}`}>
          {table
            .getAllColumns()
            .filter((column) => column.getIsVisible())
            .map((column) => ({ id: column.id, size: column.getSize() }))
            .map((column) => (
              <TableCell key={column.id} style={{ width: `${column.size}px` }}>
                <Skeleton className="h-8 w-full dark:bg-zinc-800 bg-zinc-200" />
              </TableCell>
            ))}
        </TableRow>
      ))}
    </>
  );
};

export default TableLoadingDataPlaceholder;
