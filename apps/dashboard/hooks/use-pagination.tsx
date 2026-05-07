import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@mono-repo-template/ui";
import { useEffect, useState, useMemo, useCallback } from "react";

/**
 * Generates page numbers around current page
 * @param {number} current - Current page
 * @param {number} total - Total pages
 * @returns {number[]} Array of page numbers
 */
function generateArray(current: number, total: number) {
  const arr: number[] = [];
  for (let i = current - 3; i < current; i++) if (i > 0) arr.push(i);
  for (let i = current; i <= current + 3; i++)
    if (i > total) break;
    else arr.push(i);
  return arr;
}

/**
 * Hook for pagination with smart page display
 * @param {Object} props - Hook configuration
 * @param {number} [props.totalPages=1] - Total number of pages
 * @param {function} [props.onChange] - Called when page changes
 * @returns {Object} Pagination component and state
 */
export function usePagination({
  totalPages = 1,
  onChange = null,
}: {
  totalPages?: number;
  onChange?: null | ((newPage: number) => void);
}) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (onChange) onChange(currentPage);
  }, [currentPage, onChange]);

  const arrayOfPaginationItems = useMemo(
    () => generateArray(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const RenderPagination = useCallback(
    () => (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                setCurrentPage((prev) => (prev > 1 ? prev - 1 : 1))
              }
            />
          </PaginationItem>

          {currentPage > 5 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setCurrentPage(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            </>
          )}

          {arrayOfPaginationItems.map((value) => (
            <PaginationItem key={value} className="hidden md:block">
              <PaginationLink
                isActive={value === currentPage}
                onClick={() => setCurrentPage(value)}
              >
                {value}
              </PaginationLink>
            </PaginationItem>
          ))}

          {totalPages > currentPage + 3 && (
            <>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem className="hidden md:block">
                <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) =>
                  prev < totalPages ? prev + 1 : totalPages
                )
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    ),
    [currentPage, totalPages, arrayOfPaginationItems]
  );

  return { RenderPagination, currentPage, setCurrentPage };
}
