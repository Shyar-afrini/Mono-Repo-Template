"use client";

import {
  AnimatedButton,
  EmptyDataHandler,
  FetchErrorHandler,
  Flex,
  Input,
  Label,
  LocalizedText,
  SkeletonLoadingHandler,
  Text,
} from "@mono-repo-template/ui";
import { useLocale, useTranslations } from "next-intl";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { getCurrencySymbol } from "@mono-repo-template/utils";
import ConfigSwitch from "./config-switch";
import FastPayConfigGroup from "./fastpay-config-group";
import { isBooleanConfig, isFastPayConfig } from "../types/system-config.types";
import { Save } from "lucide-react";
import { createSystemConfigClient } from "../services/system-config.client";
import {
  SystemConfigEmptyDataPlaceHolder,
  SystemConfigFetchErrorPlaceHolder,
  SystemConfigLoadingSkeleton,
} from "./system-config-placeholders";

const SystemConfigContent = () => {
  const t = useTranslations("settings.tabs.systemConfig");
  const locale = useLocale();
  const systemConfigClient = createSystemConfigClient();
  const {
    data: configs,
    isLoading,
    isError,
  } = systemConfigClient.useGetAppConfigs();
  const updateMutation = systemConfigClient.useUpdateAppConfig();

  // Local state for config values
  const [localConfigs, setLocalConfigs] = useState<Record<string, string>>({});
  const [changedConfigIds, setChangedConfigIds] = useState<Set<string>>(
    new Set()
  );
  const [fastPayErrors, setFastPayErrors] = useState<{
    storeId?: string;
    password?: string;
  }>({});

  // Initialize local state when configs are loaded
  useEffect(() => {
    if (configs && configs.length > 0) {
      const initialValues: Record<string, string> = {};
      configs.forEach((config) => {
        initialValues[config.id] = config.value;
      });
      setLocalConfigs(initialValues);
      setChangedConfigIds(new Set());
    }
  }, [configs]);

  // Get FastPay configs
  const fastPayConfigs = useMemo(() => {
    if (!configs) return null;
    const enabled = configs.find((c) => c.title === "fastpay-enabled");
    const storeId = configs.find((c) => c.title === "fastpay-store-id");
    const password = configs.find((c) => c.title === "fastpay-store-password");
    return { enabled, storeId, password };
  }, [configs]);

  const defaultCurrencyConfig = useMemo(() => {
    if (!configs) return null;
    return configs.find((c) => c.title === "default-currency") ?? null;
  }, [configs]);

  // Get boolean configs (excluding FastPay)
  const booleanConfigs = useMemo(() => {
    if (!configs) return [];
    return configs.filter(
      (config) =>
        isBooleanConfig(config.title) && !isFastPayConfig(config.title)
    );
  }, [configs]);

  // Handle config value change
  const handleConfigChange = (id: string, value: string) => {
    setLocalConfigs((prev) => ({ ...prev, [id]: value }));
    const originalConfig = configs?.find((c) => c.id === id);
    if (originalConfig && originalConfig.value !== value) {
      setChangedConfigIds((prev) => new Set(prev).add(id));
    } else {
      setChangedConfigIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Handle FastPay enabled change
  const handleFastPayEnabledChange = (enabled: boolean) => {
    if (fastPayConfigs?.enabled === undefined) return;
    const value = enabled ? "true" : "false";
    handleConfigChange(fastPayConfigs.enabled.id, value);

    // Clear errors when disabling
    if (enabled) {
      // Validate when enabling
      validateFastPay();
    } else {
      setFastPayErrors({});
    }
  };

  // Handle FastPay store ID change
  const handleFastPayStoreIdChange = (value: string) => {
    if (!fastPayConfigs?.storeId) return;
    handleConfigChange(fastPayConfigs.storeId.id, value);
    // Clear error if value is provided
    if (value.trim()) {
      setFastPayErrors((prev) => ({ ...prev, storeId: undefined }));
    }
  };

  // Handle FastPay password change
  const handleFastPayPasswordChange = (value: string) => {
    if (!fastPayConfigs?.password) return;
    handleConfigChange(fastPayConfigs.password.id, value);
    // Clear error if value is provided
    if (value.trim()) {
      setFastPayErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  // Validate FastPay fields
  const validateFastPay = (): boolean => {
    if (!fastPayConfigs) return true;
    const enabled = localConfigs[fastPayConfigs.enabled?.id ?? ""] === "true";
    if (enabled === false) return true;

    const errors: { storeId?: string; password?: string } = {};
    const storeId = localConfigs[fastPayConfigs.storeId?.id ?? ""] ?? "";
    const password = localConfigs[fastPayConfigs.password?.id ?? ""] ?? "";

    if (!storeId.trim()) {
      errors.storeId = t("validation.storeIdRequired");
    }
    if (!password.trim()) {
      errors.password = t("validation.passwordRequired");
    }

    setFastPayErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (changedConfigIds.size === 0) {
      toast.info(t("noChanges"));
      return;
    }

    // Validate FastPay if enabled
    if (fastPayConfigs?.enabled) {
      const enabled = localConfigs[fastPayConfigs.enabled.id] === "true";
      if (enabled && !validateFastPay()) {
        toast.error(t("validation.storeIdRequired"));
        return;
      }
    }

    try {
      // Batch update all changed configs
      const updatePromises = Array.from(changedConfigIds).map((id) => {
        const value = localConfigs[id];
        return updateMutation.mutateAsync({
          id,
          payload: { value },
        });
      });

      await Promise.all(updatePromises);

      toast.success(t("saved"));
      setChangedConfigIds(new Set());
      setFastPayErrors({});
    } catch (error: any) {
      console.error("Error saving configs:", error);
      // Always use translated error message for user-facing toasts
      // API error details are logged to console for debugging
      toast.error(t("error"));
    }
  };

  const hasChanges = changedConfigIds.size > 0;
  const isSaving = updateMutation.isPending;

  return (
    <FetchErrorHandler
      isError={isError}
      customErrorComponent={<SystemConfigFetchErrorPlaceHolder />}
    >
      <SkeletonLoadingHandler
        isLoading={isLoading}
        customSkeleton={<SystemConfigLoadingSkeleton />}
      >
        <EmptyDataHandler
          isEmpty={configs === undefined || configs.length === 0}
          customEmptyDataComponent={<SystemConfigEmptyDataPlaceHolder />}
        >
          <Flex direction="col" gap={4}>
            {/* Default currency (read-only) */}
            {defaultCurrencyConfig ? (
              <Flex
                direction="col"
                gap={2}
                className="rounded-lg border border-border/40 dark:bg-zinc-900/40 bg-zinc-100 p-4"
              >
                <Flex direction="col" gap={1}>
                  <Label className="text-sm font-medium">
                    <LocalizedText
                      text={t("configs.default-currency.title")}
                    />
                  </Label>
                  <Text className="text-xs text-muted-foreground">
                    <LocalizedText
                      text={t("configs.default-currency.description")}
                    />
                  </Text>
                </Flex>
                <Input
                  value={`${getCurrencySymbol(defaultCurrencyConfig.value, locale)} (${defaultCurrencyConfig.value})`}
                  disabled
                />
              </Flex>
            ) : null}

            {/* Boolean Configs */}
            {booleanConfigs.map((config) => (
              <ConfigSwitch
                key={config.id}
                config={config}
                checked={localConfigs[config.id] === "true"}
                onCheckedChange={(checked) =>
                  handleConfigChange(config.id, checked ? "true" : "false")
                }
                disabled={isSaving}
              />
            ))}

            {/* FastPay Config Group */}
            {fastPayConfigs?.enabled && (
              <FastPayConfigGroup
                enabled={localConfigs[fastPayConfigs.enabled.id] === "true"}
                storeId={
                  fastPayConfigs.storeId
                    ? (localConfigs[fastPayConfigs.storeId.id] ?? "")
                    : ""
                }
                password={
                  fastPayConfigs.password
                    ? (localConfigs[fastPayConfigs.password.id] ?? "")
                    : ""
                }
                onEnabledChange={handleFastPayEnabledChange}
                onStoreIdChange={handleFastPayStoreIdChange}
                onPasswordChange={handleFastPayPasswordChange}
                disabled={isSaving}
                storeIdError={fastPayErrors.storeId}
                passwordError={fastPayErrors.password}
              />
            )}

            {/* Save Button */}
            <Flex direction="row" justify="end">
              <AnimatedButton
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="gap-2"
              >
                <Save size={16} />
                <LocalizedText text={isSaving ? t("saving") : t("save")} />
              </AnimatedButton>
            </Flex>
          </Flex>
        </EmptyDataHandler>
      </SkeletonLoadingHandler>
    </FetchErrorHandler>
  );
};

export default SystemConfigContent;
