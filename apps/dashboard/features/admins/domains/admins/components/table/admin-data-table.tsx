"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  type SortingState,
  type VisibilityState,
  useReactTable,
} from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { Flex } from "@mono-repo-template/ui";
import { getDirection } from "@mono-repo-template/utils";

import { createAdminsClient } from "../../services/admins.client";
import { adminSearchSchema } from "../../validators";
import type { AdminWithRole } from "../../types";
import { useAdminColumns } from "./columns";
import { AdminTableToolbar } from "./admin-table-toolbar";
import { AdminTableContent } from "./admin-table-content";
import { AdminTablePagination } from "./admin-table-pagination";

export default function AdminDataTable() {
  const adminsClient = createAdminsClient();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    lastLoginAt: false,
    createdAt: false,
  });
  const columns = useAdminColumns();

  const allowedSortFields = useMemo(
    () =>
      new Set([
        "fullname",
        "email",
        "nationality",
        "gender",
        "age",
        "lastLoginAt",
        "createdAt",
      ]),
    []
  );

  const sortBy = useMemo(() => {
    if (sorting.length === 0) return undefined;
    const { id, desc } = sorting[0];
    if (!allowedSortFields.has(id)) return undefined;
    return `${id}:${desc ? "desc" : "asc"}`;
  }, [sorting, allowedSortFields]);

  const tSearch = useTranslations("admins.search");
  const [searchValue, setSearchValue] = useState<string>("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [validatedSearch, setValidatedSearch] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchValue.trim();
      if (trimmed.length === 0) {
        setSearchError(null);
        setValidatedSearch(undefined);
        return;
      }

      const result = adminSearchSchema.safeParse({ query: trimmed });
      if (!result.success) {
        const issue = result.error.issues[0];
        if (issue.code === "too_small") {
          setSearchError(tSearch("validation.tooShort"));
        } else if (issue.code === "too_big") {
          setSearchError(tSearch("validation.tooLong"));
        } else {
          setSearchError(tSearch("validation.invalid"));
        }
        setValidatedSearch(undefined);
        return;
      }

      setSearchError(null);
      setValidatedSearch(result.data.query);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchValue, tSearch]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [validatedSearch]);

  const adminQueryParams = useMemo(
    () => ({
      sortBy,
      q: validatedSearch,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
    }),
    [sortBy, validatedSearch, pagination.pageIndex, pagination.pageSize]
  );

  const {
    data: admins,
    isError,
    isPending,
  } = adminsClient.useGetAdmins(adminQueryParams);

  const memoizedAdmins = useMemo<AdminWithRole[]>(
    () => admins?.data ?? [],
    [admins?.data]
  );

  const meta = admins?.meta ?? {
    totalCount: 0,
    hasMorePages: false,
    totalPages: 1,
    currentPage: 1,
  };

  const locale = useLocale();

  const table = useReactTable<AdminWithRole>({
    data: memoizedAdmins,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnVisibilityChange: setColumnVisibility,
    columnResizeMode: "onChange",
    columnResizeDirection: getDirection(locale),
    state: {
      sorting,
      pagination,
      columnVisibility,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: meta.totalPages,
  });

  return (
    <Flex
      direction="col"
      gap={2}
      justify="between"
      className="mt-4 min-h-full select-none"
    >
      <Flex direction="col" gap={2}>
        <AdminTableToolbar
          table={table}
          searchValue={searchValue}
          searchError={searchError}
          onSearchChange={setSearchValue}
        />
        <AdminTableContent
          table={table}
          isPending={isPending}
          isError={isError}
        />
      </Flex>

      <Flex direction="col" gap={2}>
        <AdminTablePagination table={table} meta={meta} />
      </Flex>
    </Flex>
  );
}
