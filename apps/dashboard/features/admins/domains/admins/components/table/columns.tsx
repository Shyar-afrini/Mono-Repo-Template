"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Flex,
  Text,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@mono-repo-template/ui";
import { createUploadClient } from "@mono-repo-template/upload";
import { getAvatarInitials } from "@mono-repo-template/utils";
import { useMemo } from "react";
import type { AdminWithRole } from "../../types";

export const useAdminColumns = (): ColumnDef<AdminWithRole>[] => {
  const tColumns = useTranslations("admins.table.columns");
  const tStatus = useTranslations("admins.status");
  const uploadClient = useMemo(() => createUploadClient(), []);

  return [
    {
      accessorKey: "fullname",
      header: tColumns("fullname"),
      enableSorting: true,
      enableHiding: false,
      size: 220,
      minSize: 160,
      maxSize: 280,
      cell: ({ row }) => {
        const admin = row.original;
        const name = admin.fullname ?? "-";
        const profilePath = admin.profilePhoto ?? null;
        const avatarSrc = profilePath
          ? uploadClient.getFileUrl(profilePath)
          : undefined;

        return (
          <Flex align="center" gap={2}>
            <Avatar className="h-9 w-9">
              {avatarSrc ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <AvatarImage
                      className="object-cover cursor-pointer"
                      src={avatarSrc}
                      alt={name}
                    />
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader className="sr-only">
                      <DialogTitle>{name}</DialogTitle>
                    </DialogHeader>
                    <AvatarImage
                      className="h-full w-full object-cover"
                      src={avatarSrc}
                      alt={name}
                    />
                  </DialogContent>
                </Dialog>
              ) : null}
              <AvatarFallback className="text-xs font-medium uppercase">
                {getAvatarInitials(name)}
              </AvatarFallback>
            </Avatar>
            <Text span className="text-sm font-medium text-foreground">
              {name}
            </Text>
          </Flex>
        );
      },
    },
    {
      accessorKey: "email",
      header: tColumns("email"),
      enableSorting: true,
      size: 220,
      minSize: 160,
      maxSize: 280,
      cell: ({ getValue }) => {
        const email = getValue<string | null | undefined>();
        if (!email) return "-";
        return (
          <a
            href={`mailto:${email}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {email}
          </a>
        );
      },
    },
    {
      accessorKey: "role",
      header: tColumns("role"),
      enableSorting: false,
      size: 180,
      minSize: 140,
      maxSize: 220,
      cell: ({ row }) => {
        const roleName = row.original.role?.name ?? null;
        return roleName ? (
          <Badge variant="secondary" className="font-medium">
            {roleName}
          </Badge>
        ) : (
          <Text span className="text-sm text-muted-foreground">
            -
          </Text>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: tColumns("isActive"),
      enableSorting: false,
      size: 140,
      minSize: 120,
      maxSize: 180,
      cell: ({ getValue }) => {
        const value = Boolean(getValue());
        return value ? (
          <Badge variant="secondary">
            {tStatus("active")}
          </Badge>
        ) : (
          <Badge variant="destructive">
            <Text span className="text-white text-sm">
              {tStatus("inactive")}
            </Text>
          </Badge>
        );
      },
    },
  ];
};
