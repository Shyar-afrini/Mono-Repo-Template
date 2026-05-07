import type { ReactFormExtendedApi } from "@tanstack/react-form";

/**
 * Generic type for TanStack Form API
 * This is a helper type to avoid using `any` for form instances
 * ReactFormExtendedApi requires 12 type arguments, so we use a simplified version
 */
export type TanStackFormApi<TFormValues = Record<string, unknown>> =
  ReactFormExtendedApi<
    TFormValues,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;

/**
 * Type for form values in quick action callbacks
 */
export type FormValues = Record<string, unknown>;

/**
 * Type for Next.js i18n messages
 */
export type I18nMessages = Record<string, unknown>;

