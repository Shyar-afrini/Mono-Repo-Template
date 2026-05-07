import {
  Container,
  Flex,
  LocalizedText,
  TableCell,
  TableRow,
} from "@mono-repo-template/ui";
import { AlertTriangleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

const TableFetchErrorPlaceholder = ({
  visibleColumnCount,
}: {
  visibleColumnCount: number;
}) => {
  const t = useTranslations("shared.placeholders");
  return (
    <TableRow>
      <TableCell colSpan={visibleColumnCount} className="p-2 py-4">
        <Flex
          direction="row"
          align="center"
          justify="center"
          gap={2}
          className="w-full min-w-full h-full min-h-fit select-none"
        >
          <AlertTriangleIcon
            size={20}
            className="text-red-500 border dark:border-red-500/20 border-red-500/30 dark:bg-red-500/5 bg-red-500/10 p-3 rounded-lg min-h-10 h-full w-auto"
          />
          <Container className="p-3 dark:bg-red-500/5 bg-red-500/10 border dark:border-red-500/20 border-red-500/30 rounded-lg">
            <LocalizedText className="text-red-500 text-sm" text={t("error")} />
          </Container>
        </Flex>
      </TableCell>
    </TableRow>
  );
};

export default TableFetchErrorPlaceholder;
