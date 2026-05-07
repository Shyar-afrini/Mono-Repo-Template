import {
  AnimatedButton,
  Flex,
  LocalizedText,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@mono-repo-template/ui";
import { Edit, MoreVertical, ShieldCheck, Trash2 } from "lucide-react";
import React, { useState } from "react";
import UpdateRoleDialog from "../dialogs/update-role-dialog";
import { useTranslations } from "next-intl";
import AssignPermissionsDialog from "../dialogs/assign-permissons-dialog";
import DeleteRoleDialog from "../dialogs/delete-role-dialog";
import { RolesWithPermissions } from "../../services/roles.api";

const RoleOptionsPopover = ({ role }: { role: RolesWithPermissions }) => {
  const t = useTranslations("roles");
  const [open, setOpen] = useState(false);
  const [assignPermissionsOpen, setAssignPermissionsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const openModal = (setter: (value: boolean) => void) => {
    setter(true);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <AnimatedButton variant="ghost" size="icon">
            <MoreVertical size={16} />
          </AnimatedButton>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="max-w-fit p-1.5 dark:bg-zinc-900 bg-zinc-50 border dark:border-zinc-800 border-zinc-200"
        >
          <Flex direction="column" gap={1}>
            <AnimatedButton
              variant="ghost"
              size="default"
              className="w-full justify-start"
              onClick={() => openModal(setAssignPermissionsOpen)}
            >
              <ShieldCheck size={14} />
              {t("assignPermissions.button")}
            </AnimatedButton>
            <AnimatedButton
              variant="ghost"
              size="default"
              className="w-full justify-start"
              onClick={() => openModal(setEditOpen)}
            >
              <Edit size={14} />
              {t("edit.dialog.title")}
            </AnimatedButton>
            <AnimatedButton
              variant="ghost"
              size="default"
              className="w-full hover:bg-destructive hover:text-primary flex items-center justify-start text-primary"
              onClick={() => openModal(setDeleteOpen)}
            >
              <Trash2 size={16} />
              <LocalizedText text={t("delete.dialog.title")} />
            </AnimatedButton>
          </Flex>
        </PopoverContent>
      </Popover>
      <AssignPermissionsDialog
        role={role}
        open={assignPermissionsOpen}
        onOpenChange={setAssignPermissionsOpen}
        trigger={null}
      />
      <UpdateRoleDialog
        role={role}
        open={editOpen}
        onOpenChange={setEditOpen}
        trigger={null}
      />
      <DeleteRoleDialog
        role={role}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        trigger={null}
      />
    </>
  );
};

export default RoleOptionsPopover;
