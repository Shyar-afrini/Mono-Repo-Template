"use client";

import { useLocale } from "next-intl";
import { getTextDirection } from "@mono-repo-template/utils";

export function useDirection() {
  const locale = useLocale();
  return getTextDirection(locale);
}

export function useIsRTL() {
  const direction = useDirection();
  return direction === "rtl";
}
