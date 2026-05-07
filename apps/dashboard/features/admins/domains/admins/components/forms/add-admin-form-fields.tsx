import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { Flex, FormFieldSchema } from "@mono-repo-template/ui";

import FileUploader from "@/features/shared/components/file-uploader";
import { AsyncComboBox } from "@/components/async-combobox";

import { useAdminFormValidator } from "../../validators";
import useAdminsFilesStore from "../../store/admins.store";
import { createAdminsClient } from "../../services/admins.client";
import createAdminsApi from "../../services/admins.api";

export type AdminFormDefaultValues = {
  fullname: string;
  email: string;
  phoneNumber: string;
  password: string;
  profilePhoto: string | null;
  isActive: boolean;
  roleId: string;
};

const DEFAULT_VALUES: AdminFormDefaultValues = {
  fullname: "",
  email: "",
  phoneNumber: "",
  password: "",
  profilePhoto: null,
  isActive: true,
  roleId: "",
};

export const getAdminDefaultValues = (
  overrides: Partial<AdminFormDefaultValues> = {}
) => ({
  ...DEFAULT_VALUES,
  ...overrides,
});

interface UseAdminFormFieldsOptions {
  form?: any;
  overrides?: Partial<AdminFormDefaultValues>;
  mode?: "create" | "edit";
  existingProfileUrls?: string[];
  onRemoveExistingProfile?: (fileUrl: string) => Promise<void> | void;
}

const useAdminFormFields = ({
  form,
  overrides,
  mode = "create",
  existingProfileUrls,
  onRemoveExistingProfile,
}: UseAdminFormFieldsOptions = {}) => {
  const tFields = useTranslations("admins.addSheet.fields");
  const tValidation = useTranslations("admins.addSheet.validation");
  const validator = useAdminFormValidator();
  const { profileFiles, setProfileFiles } = useAdminsFilesStore();
  const adminsClient = useMemo(() => createAdminsClient(), []);
  const adminsApi = useMemo(() => createAdminsApi(), []);

  const defaultValues = useMemo(
    () => getAdminDefaultValues(overrides),
    [overrides]
  );

  const adminFormFieldsSchema: FormFieldSchema[] = useMemo(() => {
    const isCreateMode = mode === "create";

    return [
      {
        name: "fullname",
        label: tFields("fullName.label"),
        type: "text",
        required: true,
        placeholder: tFields("fullName.placeholder"),
        maxLength: 120,
        validation: {
          onChange: validator.validateFullName,
        },
        validationMessages: {
          required: tValidation("required", {
            field: tValidation("fieldNames.fullName"),
          }),
          minLength: tValidation("minLength", {
            field: tValidation("fieldNames.fullName"),
            min: 2,
          }),
          maxLength: tValidation("maxLength", {
            field: tValidation("fieldNames.fullName"),
            max: 120,
          }),
        },
      },
      {
        name: "email",
        label: tFields("email.label"),
        type: "text",
        required: true,
        placeholder: tFields("email.placeholder"),
        validation: {
          onChange: validator.validateEmail,
        },
        validationMessages: {
          required: tValidation("required", {
            field: tValidation("fieldNames.email"),
          }),
          invalid: tValidation("invalidEmail"),
        },
      },
      {
        name: "phoneNumber",
        label: tFields("phoneNumber.label"),
        type: "text",
        required: false,
        placeholder: tFields("phoneNumber.placeholder"),
        validation: {
          onChange: validator.validatePhoneNumber,
        },
      },
      // Password field - only shown in create mode
      ...(isCreateMode
        ? [
          {
            name: "password",
            label: tFields("password.label"),
            type: "password" as const,
            required: true,
            placeholder: tFields("password.placeholder"),
            validation: {
              onChange: validator.validatePassword,
            },
            validationMessages: {
              required: tValidation("required", {
                field: tValidation("fieldNames.password"),
              }),
              minLength: tValidation("password.minLength"),
              maxLength: tValidation("password.maxLength"),
              uppercase: tValidation("password.uppercase"),
              lowercase: tValidation("password.lowercase"),
              number: tValidation("password.number"),
              symbol: tValidation("password.symbol"),
            },
          },
        ]
        : []),
      form
        ? {
          customComponent: (
            <form.Field
              name="roleId"
              validators={{
                onChange: ({ value }: { value: string }) =>
                  validator.validateRoleId(value, {
                    required: tValidation("required", {
                      field: tValidation("fieldNames.role"),
                    }),
                  }),
              }}
            >
              {(fieldApi: any) => (
                <Flex direction="column" gap={2} className="w-full">
                  <AsyncComboBox
                    valueId={fieldApi.state.value ?? ""}
                    label={tFields("role.label")}
                    placeholder={tFields("role.placeholder")}
                    required
                    searchPlaceholder={tFields("role.placeholder")}
                    emptyMessage={tFields("role.empty")}
                    queryKey={adminsClient.getQueryKeys().getRoles()}
                    fetchPage={async ({ q }) => {
                      const roles = await adminsApi.getRoles();
                      const query = q.trim().toLowerCase();
                      const filtered = query
                        ? roles.filter(
                          (role) =>
                            role.name.toLowerCase().includes(query) ||
                            role.id.toLowerCase().includes(query)
                        )
                        : roles;
                      return { items: filtered, hasMore: false };
                    }}
                    getItemId={(role) => role.id}
                    getItemLabel={(role) => role.name}
                    onValueChange={(next) => {
                      fieldApi.handleChange(next?.id ?? "");
                    }}
                  />
                  {fieldApi.state.meta.errors.length > 0 ? (
                    <p className="text-sm font-medium text-destructive">
                      {fieldApi.state.meta.errors[0]}
                    </p>
                  ) : null}
                </Flex>
              )}
            </form.Field>
          ),
        }
        : {
          customComponent: <></>,
        },
      {
        customComponent: (
          <FileUploader
            type="image"
            customLabel={tFields("profilePhoto.label")}
            accept="image/*"
            files={profileFiles}
            setFiles={setProfileFiles}
            maxFiles={1}
            existingFiles={existingProfileUrls ?? []}
            onRemoveExisting={onRemoveExistingProfile}
            showPlaceholder={
              !existingProfileUrls || existingProfileUrls.length === 0
            }
          />
        ),
      },
      {
        name: "isActive",
        label: tFields("isActive.label"),
        description: tFields("isActive.description"),
        type: "switch",
        required: false,
      },
    ];
  }, [
    form,
    mode,
    profileFiles,
    existingProfileUrls,
    onRemoveExistingProfile,
    setProfileFiles,
    tFields,
    tValidation,
    validator,
    adminsApi,
    adminsClient,
  ]);

  return {
    adminFormFieldsSchema,
    defaultValues,
  } as const;
};

export default useAdminFormFields;
