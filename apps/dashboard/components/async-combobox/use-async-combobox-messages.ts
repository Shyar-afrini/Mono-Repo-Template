"use client";

import { useTranslations } from "next-intl";

import type { AsyncComboBoxMessages } from "./types";

export function useAsyncComboBoxMessages({
  emptyMessage,
  messages,
}: Readonly<{
  emptyMessage?: string;
  messages?: Partial<AsyncComboBoxMessages>;
}>): AsyncComboBoxMessages {
  const t = useTranslations("shared.asyncCombobox");

  return {
    loading: messages?.loading ?? t("loading"),
    loadingMore: messages?.loadingMore ?? t("loadingMore"),
    empty: messages?.empty ?? (emptyMessage || t("empty")),
    error: messages?.error ?? t("error"),
    retry: messages?.retry ?? t("retry"),
  };
}

