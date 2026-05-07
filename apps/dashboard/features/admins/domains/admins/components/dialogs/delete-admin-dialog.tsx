"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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

import type { Admin } from "../../types";
import { createAdminsClient } from "../../services/admins.client";

type DeleteAdminDialogProps = {
  admin: Admin;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode | null;
};

const DeleteAdminDialog = ({
  admin,
  open,
  onOpenChange,
  trigger,
}: Readonly<DeleteAdminDialogProps>) => {
  const t = useTranslations("admins");
  const tDialog = useTranslations("admins.dialogs.delete");
  const adminsClient = createAdminsClient();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationValue, setConfirmationValue] = useState("");
  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : isOpen;

  const { mutate: deleteAdmin, isPending } = adminsClient.useDeleteAdmin();

  const confirmationToken = tDialog("confirmation.token");
  const isConfirmationMatch =
    confirmationValue.trim().toLowerCase() === confirmationToken.toLowerCase();

  const handleDelete = () => {
    deleteAdmin(admin.id, {
      onSuccess: () => {
        toast.success(t("toasts.delete.success"));
        queryClient.invalidateQueries({
          queryKey: adminsClient.getQueryKeys().getAdmins(),
        });
        setConfirmationValue("");
        setIsOpen(false);
      },
      onError: () => {
        toast.error(t("toasts.delete.error"));
      },
    });
  };

  const defaultTrigger = (
    <AnimatedButton
      variant="ghost"
      size="default"
      className="w-full flex items-center justify-start hover:bg-destructive hover:text-primary text-destructive"
    >
      <Trash2 size={16} />
      <LocalizedText className="ms-2" text={tDialog("title")} />
    </AnimatedButton>
  );

  return (
    <AlertDialog
      open={dialogOpen}
      onOpenChange={(value) => {
        if (!isControlled) {
          setIsOpen(value);
        }
        if (!value) {
          setConfirmationValue("");
        }
        onOpenChange?.(value);
      }}
    >
      {trigger === null ? null : (
        <AlertDialogTrigger asChild>
          {trigger ?? defaultTrigger}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-destructive" />
            <LocalizedText text={tDialog("title")} />
          </AlertDialogTitle>
          <AlertDialogDescription>
            <LocalizedText
              text={tDialog("description", { fullname: admin.fullname })}
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Flex direction="col" gap={2} className="my-1">
          <LocalizedText
            className="text-sm text-destructive"
            text={tDialog("warning")}
          />
          <LocalizedText
            className="text-sm text-muted-foreground"
            text={tDialog("confirmation.label")}
          />
          <Input
            value={confirmationValue}
            onChange={(event) => setConfirmationValue(event.target.value)}
            placeholder={tDialog("confirmation.placeholder")}
          />
        </Flex>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <LocalizedText text={tDialog("cancel")} />
          </AlertDialogCancel>
          <AnimatedButton
            variant="destructive"
            className="w-full bg-destructive text-primary hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={!isConfirmationMatch || isPending}
            isLoading={isPending}
            loadingText={tDialog("submitting")}
          >
            <Trash2 size={16} />
            <LocalizedText className="ms-2" text={tDialog("submit")} />
          </AnimatedButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAdminDialog;
