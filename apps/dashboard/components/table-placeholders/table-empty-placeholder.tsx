"use client";

import * as React from "react";
import { FolderArchive } from "lucide-react";

import { TableCell, TableRow } from "@mono-repo-template/ui";

import { TableStatePlaceholder } from "./table-state-placeholder";

export function TableEmptyPlaceholder({
  visibleColumnCount,
  title,
  description,
}: Readonly<{
  visibleColumnCount: number;
  title: string;
  description: string;
}>) {
  return (
    <TableRow>
      <TableCell colSpan={visibleColumnCount} className="p-0">
        <TableStatePlaceholder
          title={title}
          description={description}
          icon={<FolderArchive size={20} className="dark:text-zinc-50 text-zinc-900" />}
        />
      </TableCell>
    </TableRow>
  );
}

