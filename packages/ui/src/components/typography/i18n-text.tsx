"use client";
import { HTMLAttributes } from "react";

export interface I18nTextProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "translate"> {
  messageKey: string;
  values?: Record<string, string | number>;
  fallback?: string;
  // Generic translation function that can work with any i18n library
  translateFn: (
    key: string,
    values?: Record<string, string | number>
  ) => string;
}

const I18nText = ({
  className,
  messageKey,
  values,
  fallback,
  translateFn,
  ...props
}: I18nTextProps) => {
  const translateText = () => {
    try {
      return translateFn(messageKey, values);
    } catch (error) {
      console.warn(`Translation failed for key: ${messageKey}`, error);
      return fallback || messageKey;
    }
  };

  return (
    <span className={className} {...props}>
      {translateText()}
    </span>
  );
};

export default I18nText;
