import { ValidationMessages } from "@mono-repo-template/types";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export const useLoginFormValidator = () => {
  return {
    validateEmail: (value: string, messages?: ValidationMessages) => {
      const result = loginSchema.shape.email.safeParse(value);
      if (!result.success) {
        const error = result.error.issues[0];
        if (error.code === "too_small") {
          return messages?.required || error.message;
        }
        return messages?.invalid || error.message;
      }
      return undefined;
    },
    validatePassword: (value: string, messages?: ValidationMessages) => {
      const result = loginSchema.shape.password.safeParse(value);
      if (!result.success) {
        const error = result.error.issues[0];
        if (error.code === "too_small") {
          return value.length === 0
            ? messages?.required || error.message
            : messages?.minLength || error.message;
        }
        return messages?.invalid || error.message;
      }
      return undefined;
    },
  };
};
