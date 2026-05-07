"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  AnimatedButton,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Flex,
  Input,
  LocalizedText,
  toast,
} from "@mono-repo-template/ui";

import type { Role } from "@mono-repo-template/types";
import { createRolesClient } from "../../services/roles.client";

type UpdateRoleDialogProps = {
  role: Role;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
  onUpdated?: () => void;
};

const MIN_LENGTH = 2;
const MAX_LENGTH = 50;

const UpdateRoleDialog = ({
  role,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  children,
  onUpdated,
}: UpdateRoleDialogProps) => {
  const t = useTranslations("roles.edit.dialog");
  const tValidation = useTranslations("roles.validation");
  const tToasts = useTranslations("roles.toasts");
  const rolesClient = createRolesClient();
  const { mutateAsync: updateRole, isPending } = rolesClient.useUpdateRole();
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState(role.name ?? "");
  const [error, setError] = useState<string | null>(null);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = (value: boolean) => {
    // Always execute reset logic when closing
    if (!value) {
      setName(role.name ?? "");
      setError(null);
    }
    // Then update state (controlled or uncontrolled)
    if (controlledOnOpenChange) {
      controlledOnOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const validateName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return tValidation("nameRequired");
    }
    if (trimmed.length < MIN_LENGTH) {
      return tValidation("nameMin");
    }
    if (trimmed.length > MAX_LENGTH) {
      return tValidation("nameMax");
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationMessage = validateName(name);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      await updateRole({ id: role.id, name: name.trim() });
      toast.success(tToasts("updateSuccess"));
      setError(null);
      handleOpenChange(false);
      onUpdated?.();
    } catch (error) {
      console.error(error);
      toast.error(tToasts("updateError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger !== null && (
        <DialogTrigger asChild>{trigger || children}</DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Flex direction="column" gap={2} className="py-2">
          <Input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (error) {
                setError(null);
              }
            }}
            placeholder={tValidation("fieldNames.role")}
            aria-invalid={Boolean(error)}
          />
          {error ? (
            <LocalizedText
              id={`role-edit-error-${role.id}`}
              className="text-sm text-destructive"
              text={error}
            />
          ) : null}
        </Flex>
        <DialogFooter>
          <AnimatedButton
            variant="default"
            onClick={handleSubmit}
            disabled={isPending}
            isLoading={isPending}
            loadingText={t("submitting")}
          >
            <LocalizedText text={t("submit")} />
          </AnimatedButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRoleDialog;
