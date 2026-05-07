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
import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useMemo } from "react";

import { createAdminsClient } from "../../services/admins.client";
import useAdminFormFields, {
  getAdminDefaultValues,
} from "../forms/add-admin-form-fields";
import {
  createUploadClient,
  type UploadedFilePayload,
} from "@mono-repo-template/upload";
import useAdminsFilesStore from "../../store/admins.store";
import useErrorToast from "@/hooks/use-error-toast";

type AddAdminSheetProps = {
  children: React.ReactNode;
};

const AddAdminSheet = ({ children }: AddAdminSheetProps) => {
  const locale = useLocale();
  const t = useTranslations("admins.addSheet");
  const qc = useQueryClient();
  const { showErrorToast } = useErrorToast();

  const adminsClient = useMemo(() => createAdminsClient(), []);
  const uploadClient = useMemo(() => createUploadClient(), []);

  const { profileFiles, clearProfileFiles } = useAdminsFilesStore();
  const { mutateAsync: uploadFileAsync, isPending: isUploadingFile } =
    uploadClient.uploadFile();
  const { mutateAsync: deleteFilesByIdsAsync } =
    uploadClient.deleteFilesByIds();
  const { mutateAsync: createAdminAsync, isPending: isCreatingAdmin } =
    adminsClient.useCreateAdmin();

  const defaultValues = useMemo(() => getAdminDefaultValues(), []);

  const form = useForm({
    defaultValues,
    onSubmit: async (values) => {
      let uploadedProfileFile: UploadedFilePayload | null = null;

      try {
        // 1) Upload profile photo
        const profileFile = profileFiles?.[0];
        let profilePhotoUrl: string | null = null;

        if (profileFile) {
          uploadedProfileFile = await uploadFileAsync({
            file: profileFile,
            path: "admins",
          });
          profilePhotoUrl = uploadedProfileFile?.url ?? null;
        }

        await createAdminAsync({
          fullname: values.value.fullname ?? "",
          email: values.value.email ?? "",
          phoneNumber: values.value.phoneNumber?.trim() || null,
          password: values.value.password ?? "",
          profilePhoto: profilePhotoUrl,
          isActive: Boolean(values.value.isActive),
          roleId: values.value.roleId || undefined,
        });

        toast.success(t("toasts.success"));
        clearProfileFiles();
        form.reset(defaultValues);
        qc.invalidateQueries({
          queryKey: adminsClient.getQueryKeys().getAdmins(),
        });
      } catch (error: any) {
        // Cleanup uploaded files on error
        const filesToDelete: string[] = [];

        if (uploadedProfileFile) {
          filesToDelete.push(uploadedProfileFile.id);
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

  const { adminFormFieldsSchema } = useAdminFormFields({
    form,
    mode: "create",
  });

  return (
    <Sheet
      onOpenChange={(open) => {
        if (!open) {
          clearProfileFiles();
          form.reset(defaultValues);
        }
      }}
    >
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className="md:min-w-lg w-full md:w-xl flex flex-col h-full"
        side={localeBasedDirection(locale, "right", "left")}
      >
        <Flex direction="row" gap={2} justify="between" align="center" className="shrink-0">
          <Flex direction="column" gap={1}>
            <SheetHeader>
              <SheetTitle>{t("title")}</SheetTitle>
              <SheetDescription>{t("description")}</SheetDescription>
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              disabled={
                !canSubmit ||
                isSubmitting ||
                isPristine ||
                isCreatingAdmin ||
                isUploadingFile
              }
              className="w-full mt-2 shrink-0"
              variant="default"
              onClick={() => form.handleSubmit()}
              isLoading={isCreatingAdmin || isUploadingFile}
              loadingText={t("submitting")}
            >
              <LocalizedText text={t("submit")} />
            </AnimatedButton>
          )}
        </form.Subscribe>
      </SheetContent>
    </Sheet>
  );
};

export default AddAdminSheet;
