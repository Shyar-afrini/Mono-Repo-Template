/*
 This component is used to display a toast message when an error occurs.
 pass the @param errorCode to the component to display the error message.
*/

import { useTranslations } from "next-intl";
import { toast } from "@mono-repo-template/ui";
import { ToasterProps } from "sonner";
import { errorCodes } from "@/messages/en.json";

/**
 * Builds a path string by joining prefix and key with a dot if prefix exists
 */
type BuildPath<Prefix extends string, Key extends string> = Prefix extends ""
  ? Key
  : `${Prefix}.${Key}`;


/**
 * Extracts all nested paths from an object structure
 * Example: { notifications: { NOT_FOUND: "..." } } -> "notifications.NOT_FOUND"
 */
type ExtractPaths<T, Prefix extends string = ""> = T extends Record<string, any>
  ? {
    [Key in keyof T]: Key extends string
    ? T[Key] extends Record<string, any>
    ? ExtractPaths<T[Key], BuildPath<Prefix, Key>>
    : BuildPath<Prefix, Key>
    : never;
  }[keyof T]
  : never;

/**
 * All valid error code paths from the errorCodes object
 * Provides IntelliSense for error codes like "notifications.NOTIFICATION_NOT_FOUND"
 */
type ErrorCodePath = ExtractPaths<typeof errorCodes>;

interface ToastOptions {
  code: ErrorCodePath;
  type?: "success" | "error" | "warning" | "info";
  toastOptions?: ToasterProps;
}

const useErrorToast = () => {
  const t = useTranslations("errorCodes");

  const showErrorToast = ({ code, type = "error", toastOptions }: ToastOptions) => {
    return toast[type](t(code), toastOptions);
  };

  return { showErrorToast };
};

export default useErrorToast;
