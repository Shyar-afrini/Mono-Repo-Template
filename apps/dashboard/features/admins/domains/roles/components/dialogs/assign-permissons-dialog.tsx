"use client";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Dialog,
  DialogTrigger,
  Container,
  ScrollArea,
  ScrollBar,
  FetchErrorHandler,
  SkeletonLoadingHandler,
  EmptyDataHandler,
  Flex,
  AnimatedButton,
  LocalizedText,
  toast,
} from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { createRolesClient } from "../../services/roles.client";
import { RolesWithPermissions } from "../../services/roles.api";
import {
  PermissionsErrorComponent,
  PermissionsSkeletonLoader,
  PermissionsEmptyDataComponent,
} from "../permissions-placeholders";
import PermissionsSelector from "../permissions-selector";

interface AssignPermissionsDialogProps {
  role: RolesWithPermissions;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

const AssignPermissionsDialog = ({
  role,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
  children,
}: AssignPermissionsDialogProps) => {
  const t = useTranslations("roles.assignPermissions.dialog");
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = (value: boolean) => {
    // Always execute reset logic when closing
    if (!value) {
      // Reset to original permissions when dialog closes
      setSelectedPermissions(new Set(role.permissions || []));
    }
    // Then update state (controlled or uncontrolled)
    if (controlledOnOpenChange) {
      controlledOnOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const rolesClient = createRolesClient();
  const {
    data: allPermissions,
    isLoading,
    isError,
  } = rolesClient.useGetPermissions();
  const { mutateAsync: updateRolePermissions, isPending } =
    rolesClient.useUpdateRolePermissions();
  const tToasts = useTranslations("roles.toasts");

  // Initialize selected permissions with role's current permissions
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(role.permissions || [])
  );

  // Reset when role changes or dialog opens
  useEffect(() => {
    if (open) {
      setSelectedPermissions(new Set(role.permissions || []));
    }
  }, [role.permissions, open]);

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      const [resource, action] = permission.split(":");

      if (newSet.has(permission)) {
        // Unchecking
        newSet.delete(permission);

        // If unchecking write, don't auto-uncheck read
        // (user might want read without write)
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

  const handleSave = async () => {
    try {
      await updateRolePermissions({
        id: role.id,
        permissions: Array.from(selectedPermissions),
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.success(tToasts("updatePermissionsSuccess" as any));
      handleOpenChange(false);
    } catch (error) {
      console.error("Error updating role permissions:", error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toast.error(tToasts("updatePermissionsError" as any));
    }
  };

  const handleCancel = () => {
    setSelectedPermissions(new Set(role.permissions || []));
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger !== null && (
        <DialogTrigger asChild>{trigger || children}</DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px]">
          <Container className="w-full h-full mt-3">
            <FetchErrorHandler
              isError={isError}
              customErrorComponent={<PermissionsErrorComponent />}
            >
              <SkeletonLoadingHandler
                isLoading={isLoading}
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

        <Flex
          direction="row"
          gap={2}
          justify="end"
          className="mt-4 pt-4 border-t dark:border-zinc-800 border-zinc-200"
        >
          <AnimatedButton
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            <LocalizedText text={t("cancel")} />
          </AnimatedButton>
          <AnimatedButton
            variant="default"
            onClick={handleSave}
            isLoading={isPending}
            loadingText={t("submitting")}
            disabled={isPending}
          >
            <LocalizedText text={t("submit")} />
          </AnimatedButton>
        </Flex>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPermissionsDialog;
