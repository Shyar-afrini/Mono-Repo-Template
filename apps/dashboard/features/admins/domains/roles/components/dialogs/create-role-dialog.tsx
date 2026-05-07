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
  Container,
  ScrollArea,
  ScrollBar,
  FetchErrorHandler,
  SkeletonLoadingHandler,
  EmptyDataHandler,
  DialogClose,
} from "@mono-repo-template/ui";
import { createRolesClient } from "../../services/roles.client";
import PermissionsSelector from "../permissions-selector";
import {
  PermissionsErrorComponent,
  PermissionsSkeletonLoader,
  PermissionsEmptyDataComponent,
} from "../permissions-placeholders";

const MIN_LENGTH = 2;
const MAX_LENGTH = 50;

const CreateRoleDialog = () => {
  const t = useTranslations("roles.create.dialog");
  const tValidation = useTranslations("roles.validation");
  const tToasts = useTranslations("roles.toasts");
  const rolesClient = createRolesClient();
  const { mutateAsync: createRole, isPending } = rolesClient.useCreateRole();
  const {
    data: allPermissions,
    isLoading: isLoadingPermissions,
    isError: isErrorPermissions,
  } = rolesClient.useGetPermissions();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );

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

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      const [resource, action] = permission.split(":");

      if (newSet.has(permission)) {
        // Unchecking
        newSet.delete(permission);
      } else {
        // Checking
        newSet.add(permission);

        // If checking write, also check read
        if (action === "write") {
          const readPermission = `${resource}:read`;
          if (!newSet.has(readPermission)) {
            newSet.add(readPermission);
          }
        }
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    const validationMessage = validateName(name);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      await createRole({
        name: name.trim(),
        permissions: Array.from(selectedPermissions),
      });
      toast.success(tToasts("createSuccess"));
      setName("");
      setError(null);
      setSelectedPermissions(new Set());
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(tToasts("createError"));
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setName("");
      setError(null);
      setSelectedPermissions(new Set());
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <AnimatedButton variant="default" size="sm">
          <LocalizedText text={t("submit")} />
        </AnimatedButton>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Flex direction="column" gap={4} className="py-2">
          <Flex direction="column" gap={2}>
            <Input
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) {
                  setError(null);
                }
              }}
              placeholder={t("namePlaceholder")}
              aria-invalid={Boolean(error)}
              aria-describedby="role-name-error"
            />
            {error ? (
              <LocalizedText
                id="role-name-error"
                className="text-sm text-destructive"
                text={error}
              />
            ) : null}
          </Flex>
          <ScrollArea className="h-[400px]">
            <Container className="w-full h-full">
              <FetchErrorHandler
                isError={isErrorPermissions}
                customErrorComponent={<PermissionsErrorComponent />}
              >
                <SkeletonLoadingHandler
                  isLoading={isLoadingPermissions}
                  customSkeleton={<PermissionsSkeletonLoader />}
                >
                  <EmptyDataHandler
                    isEmpty={!allPermissions || allPermissions.length === 0}
                    customEmptyDataComponent={<PermissionsEmptyDataComponent />}
                  >
                    <PermissionsSelector
                      allPermissions={allPermissions || []}
                      selectedPermissions={selectedPermissions}
                      onToggle={handlePermissionToggle}
                    />
                  </EmptyDataHandler>
                </SkeletonLoadingHandler>
              </FetchErrorHandler>
            </Container>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </Flex>
        <DialogFooter>
          <DialogClose>
            <AnimatedButton variant="outline">
              <LocalizedText text={t("cancel")} />
            </AnimatedButton>
          </DialogClose>
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

export default CreateRoleDialog;
