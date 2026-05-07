"use client";

import type { Table as TanstackTable } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  Button,
  Container,
  Flex,
  LocalizedText,
  Text,
} from "@mono-repo-template/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { FlipOnRTL } from "@/components/flip-on-rtl";
import type { Admin } from "../../types";

type AdminTablePaginationProps = {
  table: TanstackTable<Admin>;
  meta: {
    totalCount: number;
    hasMorePages: boolean;
    totalPages: number;
    currentPage: number;
  };
};

export function AdminTablePagination({
  table,
  meta,
}: Readonly<AdminTablePaginationProps>) {
  const t = useTranslations("pagination");

  return (
    <>
      <Container>
        <Flex direction="row" gap={2}>
          <Container>
            <Text span className="text-sm text-muted-foreground">
              {t("page")} {meta?.currentPage}
              {t("of")} {meta?.totalPages}
            </Text>
          </Container>
        </Flex>
      </Container>

      <Container>
        <Flex direction="row" align="start" gap={2}>
          <Button
            onClick={() => table.previousPage()}
            disabled={!meta?.currentPage || meta?.currentPage === 1}
            variant={"secondary"}
            size={"sm"}
          >
            <FlipOnRTL>
              <ChevronLeft />
            </FlipOnRTL>
            <LocalizedText text={t("previous")} />
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={
              !meta?.hasMorePages || meta?.currentPage === meta?.totalPages
            }
            variant={meta.hasMorePages ? "secondary" : "outline"}
            size={"sm"}
          >
            <LocalizedText text={t("next")} />
            <FlipOnRTL>
              <ChevronRight />
            </FlipOnRTL>
          </Button>
        </Flex>
      </Container>
    </>
  );
}
