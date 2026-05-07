"use client";

import { useTranslations } from "next-intl";
import { createTranslationWrapper } from "@mono-repo-template/utils";

// Create a dashboard-specific translation hook
export const useAppTranslations = createTranslationWrapper(useTranslations);
