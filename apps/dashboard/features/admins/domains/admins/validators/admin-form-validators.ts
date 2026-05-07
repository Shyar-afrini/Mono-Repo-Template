import { ValidationMessages } from "@mono-repo-template/types";
import { z } from "zod";

export const ADMIN_DOCUMENT_PLACEHOLDER = "";

const passwordRegex = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /\d/,
  symbol: /[^A-Za-z0-9]/,
};

const extendedSchema = {
  fullname: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name must be less than 120 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().nullable().optional(),
  password: z.string(),
  profilePhoto: z
    .string()
    .url("Profile photo must be a valid URL")
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
  roleId: z.string().min(1, "Role is required"),
};

export const adminSchema = z.object(extendedSchema);

export type AdminFormValues = z.infer<typeof adminSchema>;

type ExtendedValidationMessages = ValidationMessages & {
  uppercase?: string;
  lowercase?: string;
  number?: string;
  symbol?: string;
};

export const useAdminFormValidator = () => {
  return {
    validateFullName: (value: string, messages?: ValidationMessages) => {
      const result = adminSchema.shape.fullname.safeParse(value);
      if (!result.success) {
        const issue = result.error.issues[0];
        if (issue.code === "too_small") {
          return value.length === 0
            ? messages?.required || issue.message
            : messages?.minLength || issue.message;
        }
        if (issue.code === "too_big") {
          return messages?.maxLength || issue.message;
        }
        return messages?.invalid || issue.message;
      }
      return undefined;
    },
    validateEmail: (value: string, messages?: ValidationMessages) => {
      const result = adminSchema.shape.email.safeParse(value);
      if (!result.success) {
        return messages?.invalid || result.error.issues[0]?.message;
      }
      return undefined;
    },
    validatePhoneNumber: (value: string | null | undefined) => {
      if (!value || value.trim().length === 0) {
        return undefined;
      }

      const normalized = value.trim();
      const validPattern = /^[0-9+\-\s()]{7,20}$/;
      if (!validPattern.test(normalized)) {
        return "Invalid phone number";
      }
      return undefined;
    },
    validatePassword: (
      value: string,
      messages?: ExtendedValidationMessages
    ) => {
      if (!value || value.trim().length === 0) {
        return messages?.required;
      }
      if (value.length < 8) {
        return messages?.minLength;
      }
      if (value.length > 64) {
        return messages?.maxLength;
      }
      if (!passwordRegex.uppercase.test(value)) {
        return messages?.uppercase;
      }
      if (!passwordRegex.lowercase.test(value)) {
        return messages?.lowercase;
      }
      if (!passwordRegex.number.test(value)) {
        return messages?.number;
      }
      if (!passwordRegex.symbol.test(value)) {
        return messages?.symbol;
      }
      return undefined;
    },
    validateRoleId: (value: string, messages?: ValidationMessages) => {
      const result = adminSchema.shape.roleId.safeParse(value);
      if (!result.success) {
        return messages?.required || result.error.issues[0]?.message;
      }
      return undefined;
    },
    validateProfilePhoto: (
      value: string | null | undefined,
      messages?: ValidationMessages
    ) => {
      if (!value) return undefined;
      const result = adminSchema.shape.profilePhoto.safeParse(value);
      if (!result.success) {
        return messages?.invalid || result.error.issues[0]?.message;
      }
      return undefined;
    },
  };
};
