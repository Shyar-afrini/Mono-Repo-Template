"use client";

import {
  AnimatedButton,
  Button,
  Flex,
  LocalizedText,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@mono-repo-template/ui";
import { Edit, EllipsisVertical, KeyRound, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Admin } from "../../types";
import ToggleAdminStatusButton from "./toggle-admin-status-button";
import DeleteAdminDialog from "../dialogs/delete-admin-dialog";
import ChangeAdminPasswordDialog from "../dialogs/change-admin-password-dialog";
import EditAdminSheet from "../sheets/edit-admin-sheet";
import { useState } from "react";

type AdminActionsPopoverProps = {
  admin: Admin;
};

const AdminActionsPopover = ({ admin }: Readonly<AdminActionsPopoverProps>) => {
  const t = useTranslations("admins.actions");
  const tActions = useTranslations("admins.table.actions");
  const tDelete = useTranslations("admins.dialogs.delete");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const openModal = (setter: (value: boolean) => void) => {
    setter(true);
    setOpen(false);
  };
  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="max-w-fit p-1.5">
          <Flex direction="column" gap={1}>
            <AnimatedButton
              variant="ghost"
              size="default"
              className="w-full justify-start"
              onClick={() => openModal(setEditOpen)}
            >
              <Edit size={16} />
              <LocalizedText text={tActions("edit")} />
            </AnimatedButton>
            <AnimatedButton
              variant="ghost"
              size="default"
              className="w-full flex items-center justify-start"
              onClick={() => openModal(setPasswordOpen)}
            >
              <KeyRound size={16} />
              <LocalizedText
                className="ms-2"
                text={t("changePassword")}
              />
            </AnimatedButton>
            <ToggleAdminStatusButton admin={admin} setOpen={setOpen} />
            <AnimatedButton
              variant="ghost"
              size="default"
              className="w-full flex items-center justify-start hover:bg-destructive hover:text-primary text-destructive"
              onClick={() => openModal(setDeleteOpen)}
            >
              <Trash2 size={16} />
              <LocalizedText className="ms-2" text={tDelete("title")} />
            </AnimatedButton>
          </Flex>
        </PopoverContent>
      </Popover>
      <EditAdminSheet
        admin={admin}
        open={editOpen}
        onOpenChange={setEditOpen}
        trigger={null}
      />
      <DeleteAdminDialog
        admin={admin}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        trigger={null}
      />
      <ChangeAdminPasswordDialog
        admin={admin}
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        onSuccess={() => setOpen(false)}
        trigger={null}
      />
    </>
  );
};

export default AdminActionsPopover;
