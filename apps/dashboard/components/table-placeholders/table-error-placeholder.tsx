"use client";

import * as React from "react";
import { AlertTriangleIcon } from "lucide-react";

import { TableCell, TableRow } from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";

import { TableStatePlaceholder } from "./table-state-placeholder";

export function TableErrorPlaceholder({
  visibleColumnCount,
  title,
  description,
}: Readonly<{
  visibleColumnCount: number;
  title?: string;
  description?: string;
}>) {
  const tShared = useTranslations("shared.placeholders");

  return (
    <TableRow>
      <TableCell colSpan={visibleColumnCount} className="p-0">
        <TableStatePlaceholder
          title={title ?? tShared("error")}
          description={description ?? ""}
          icon={<AlertTriangleIcon size={20} className="text-destructive" />}
          iconContainerClassName="dark:bg-destructive/10 bg-destructive/10"
          titleClassName="text-destructive"
          descriptionClassName="text-destructive/80"
        />
      </TableCell>
    </TableRow>
  );
}

