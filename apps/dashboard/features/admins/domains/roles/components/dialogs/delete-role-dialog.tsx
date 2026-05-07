"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AnimatedButton,
  Flex,
  Input,
  LocalizedText,
  toast,
} from "@mono-repo-template/ui";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { createRolesClient } from "../../services/roles.client";
import { RolesWithPermissions } from "../../services/roles.api";

interface DeleteRoleDialogProps {
  role: RolesWithPermissions;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const DeleteRoleDialog = ({
  role,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: DeleteRoleDialogProps) => {
  const t = useTranslations("roles.delete.dialog");
  const tToasts = useTranslations("roles.toasts");
  const rolesClient = createRolesClient();
  const qc = useQueryClient();
  const [internalOpen, setInternalOpen] = useState(false);
  const [confirmationValue, setConfirmationValue] = useState("");
  const { mutate: deleteRole, isPending } = rolesClient.useDeleteRole();
  
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const confirmationToken = t("confirmation.token");
  const isConfirmationMatch =
    confirmationValue.trim().toLowerCase() === confirmationToken.toLowerCase();

  const handleDeleteRole = () => {
    deleteRole(role.id, {
      onSuccess: () => {
        toast.success(tToasts("deleteSuccess"));
        setIsOpen(false);
        setConfirmationValue("");
        qc.invalidateQueries({
          queryKey: rolesClient.getQueryKeys().list(),
        });
      },
      onError: () => {
        toast.error(tToasts("deleteError"));
      },
    });
  };

  const defaultTrigger = (
    <AnimatedButton
      variant="ghost"
      size="default"
      className="w-full hover:bg-destructive hover:text-primary flex items-center justify-start text-primary"
    >
      <Trash2 size={16} />
      <LocalizedText text={t("title")} />
    </AnimatedButton>
  );

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setConfirmationValue("");
        }
      }}
    >
      {trigger !== null && (
        <AlertDialogTrigger asChild>{trigger || defaultTrigger}</AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle size={16} />
            <LocalizedText text={t("title")} />
          </AlertDialogTitle>
          <AlertDialogDescription>
            <LocalizedText
              text={t("description", {
                name: role.name,
              })}
            />
          </AlertDialogDescription>
          <Flex direction="col" align="start" gap={2} className="mt-4">
            <LocalizedText
              className="text-sm text-destructive text-start"
              text={t("warning")}
            />
            <LocalizedText
              className="text-sm text-muted-foreground"
              text={t("confirmation.label")}
            />
            <Input
              value={confirmationValue}
              onChange={(event) => setConfirmationValue(event.target.value)}
              placeholder={t("confirmation.placeholder")}
            />
          </Flex>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <LocalizedText text={t("cancel")} />
          </AlertDialogCancel>
          <AnimatedButton
            variant="destructive"
            className="w-full bg-destructive text-primary hover:bg-destructive/90"
            onClick={handleDeleteRole}
            disabled={isPending || !isConfirmationMatch}
            isLoading={isPending}
            loadingText={t("submitting")}
          >
            <Trash2 size={16} />
            <LocalizedText text={t("submit")} />
          </AnimatedButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteRoleDialog;
