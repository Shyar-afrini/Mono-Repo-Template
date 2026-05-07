/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  AnimatedButton,
  Flex,
  FormSchemaRenderer,
  LocalizedText,
  ScrollArea,
  ScrollBar,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  toast,
} from "@mono-repo-template/ui";
import { localeBasedDirection } from "@mono-repo-template/utils";
import { Edit, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createUploadClient,
  type UploadedFilePayload,
} from "@mono-repo-template/upload";
import { createAdminsClient } from "../../services/admins.client";
import useAdminsFilesStore from "../../store/admins.store";
import type { Admin, UpdateAdminInput } from "../../types";
import useAdminFormFields, {
  getAdminDefaultValues,
  type AdminFormDefaultValues,
} from "../forms/add-admin-form-fields";
import useErrorToast from "@/hooks/use-error-toast";

const useAdminOverrides = (admin: Admin) =>
  useMemo<Partial<AdminFormDefaultValues>>(
    () => ({
      fullname: admin.fullname ?? "",
      email: admin.email ?? "",
      phoneNumber: admin.phoneNumber ?? "",
      password: "",
      profilePhoto: admin.profilePhoto ?? null,
      isActive: admin.isActive,
      roleId: admin.roleId ?? "",
    }),
    [admin]
  );

type EditAdminSheetProps = {
  admin: Admin;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode | null;
};

const EditAdminSheet = ({
  admin,
  open,
  onOpenChange,
  trigger,
}: Readonly<EditAdminSheetProps>) => {
  const locale = useLocale();
  const tSheet = useTranslations("admins.editSheet");
  const tActions = useTranslations("admins.table.actions");
  const tToasts = useTranslations("admins.toasts.update");
  const { showErrorToast } = useErrorToast();

  const overrides = useAdminOverrides(admin);
  const baseDefaultValues = useMemo(
    () => getAdminDefaultValues(overrides),
    [overrides]
  );

  const uploadClient = useMemo(() => createUploadClient(), []);
  const adminsClient = useMemo(() => createAdminsClient(), []);
  const qc = useQueryClient();

  const {
    profileFiles,
    clearProfileFiles,
  } = useAdminsFilesStore();
  const { mutateAsync: uploadFileAsync, isPending: isUploadingFile } =
    uploadClient.uploadFile();
  const { mutateAsync: deleteFilesByIdsAsync } =
    uploadClient.deleteFilesByIds();
  const { mutateAsync: updateAdminAsync, isPending: isUpdatingAdmin } =
    adminsClient.useUpdateAdmin();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const sheetOpen = isControlled ? open : internalOpen;

  const initialPhotoUrl = useMemo(() => {
    if (!admin.profilePhoto) return null;
    return uploadClient.getFileUrl(admin.profilePhoto);
  }, [admin.profilePhoto, uploadClient]);

  const [existingPhotoPath, setExistingPhotoPath] = useState<string | null>(
    admin.profilePhoto ?? null
  );
  const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>(
    initialPhotoUrl ? [initialPhotoUrl] : []
  );
  // Keep the query to ensure data is fresh while editing (even if we don't
  // directly use the response here).
  adminsClient.useGetAdminById(admin.id, sheetOpen);

  const form = useForm({
    defaultValues: baseDefaultValues,
    onSubmit: async (values) => {
      let uploadedFile: UploadedFilePayload | null = null;
      try {
        const profileFile = profileFiles[0];
        let profilePhotoPath = existingPhotoPath;

        if (profileFile) {
          uploadedFile = await uploadFileAsync({
            file: profileFile,
            path: "admins",
          });
          profilePhotoPath = uploadedFile?.url ?? profilePhotoPath;
        }

        const payload: UpdateAdminInput = {
          fullname: values.value.fullname ?? admin.fullname,
          email: values.value.email ?? admin.email,
          phoneNumber: values.value.phoneNumber?.trim() || null,
          isActive: Boolean(values.value.isActive),
          roleId: values.value.roleId || admin.roleId || undefined,
          profilePhoto: profilePhotoPath ?? null,
        };

        await updateAdminAsync({
          id: admin.id,
          admin: payload,
        });

        toast.success(tToasts("success"));
        qc.invalidateQueries({
          queryKey: adminsClient.getQueryKeys().getAdmins(),
        });
        resetState();
        if (onOpenChange) {
          onOpenChange(false);
        } else {
          setInternalOpen(false);
        }
      } catch (error: any) {
        const filesToDelete: string[] = [];

        if (uploadedFile) {
          filesToDelete.push(uploadedFile.id);
        }

        if (filesToDelete.length > 0) {
          try {
            await deleteFilesByIdsAsync(filesToDelete);
          } catch (cleanupError) {
            console.error(cleanupError);
          }
        }
        showErrorToast({
          code: error?.response?.data?.error?.code || "INTERNAL_SERVER_ERROR",
          type: "error",
        });
      }
    },
  });

  const handleRemoveExistingProfile = useCallback(async () => {
    setExistingPhotoPath(null);
    setExistingPhotoUrls([]);
    form.setFieldValue("profilePhoto", null);
  }, [form]);

  const { adminFormFieldsSchema } = useAdminFormFields({
    form: form,
    overrides,
    mode: "edit",
    existingProfileUrls: existingPhotoUrls,
    onRemoveExistingProfile: handleRemoveExistingProfile,
  });

  const resetState = useCallback(() => {
    clearProfileFiles();
    form.reset(getAdminDefaultValues(overrides));

    const path = admin.profilePhoto ?? null;
    setExistingPhotoPath(path);
    setExistingPhotoUrls(path ? [uploadClient.getFileUrl(path)] : []);
  }, [
    admin.profilePhoto,
    clearProfileFiles,
    form,
    overrides,
    uploadClient,
  ]);

  useEffect(() => {
    resetState();
  }, [admin.id, resetState]);

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      // Closing: reset everything
      resetState();
    }
    // Then update state (controlled or uncontrolled)
    if (isControlled && onOpenChange) {
      onOpenChange(value);
    } else if (!isControlled) {
      setInternalOpen(value);
    }
  };

  const isBusy = isUploadingFile || isUpdatingAdmin;

  const defaultTrigger = (
    <AnimatedButton
      variant="ghost"
      size="default"
      className="w-full flex items-center justify-start"
    >
      <Edit size={16} />
      <LocalizedText text={tActions("edit")} />
    </AnimatedButton>
  );

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {trigger === null ? null : (
        <SheetTrigger asChild>{trigger ?? defaultTrigger}</SheetTrigger>
      )}
      <SheetContent
        className="md:min-w-lg w-full md:w-xl flex flex-col h-full"
        side={localeBasedDirection(locale, "right", "left")}
      >
        <Flex direction="row" gap={2} justify="between" align="center" className="shrink-0">
          <Flex direction="column" gap={1}>
            <SheetHeader>
              <SheetTitle>
                <LocalizedText text={tSheet("title")} />
              </SheetTitle>
              <SheetDescription>
                <LocalizedText text={tSheet("description")} />
              </SheetDescription>
            </SheetHeader>
          </Flex>
          <SheetClose asChild>
            <AnimatedButton variant="ghost" size="icon">
              <X size={16} />
            </AnimatedButton>
          </SheetClose>
        </Flex>

        <ScrollArea className="mt-3 flex-1 min-h-0">
          <FormSchemaRenderer
            form={form as any}
            schema={adminFormFieldsSchema}
          />
          <ScrollBar orientation="vertical" />
        </ScrollArea>

        <form.Subscribe
          selector={(state) => [
            state.canSubmit,
            state.isSubmitting,
            state.isPristine,
          ]}
        >
          {([canSubmit, isSubmitting, isPristine]) => (
            <AnimatedButton
              disabled={!canSubmit || isSubmitting || isPristine || isBusy}
              className="w-full mt-2 shrink-0"
              variant="default"
              onClick={() => form.handleSubmit()}
              isLoading={isBusy}
              loadingText={tSheet("submitting")}
            >
              <LocalizedText text={tSheet("submit")} />
            </AnimatedButton>
          )}
        </form.Subscribe>
      </SheetContent>
    </Sheet>
  );
};

export default EditAdminSheet;
