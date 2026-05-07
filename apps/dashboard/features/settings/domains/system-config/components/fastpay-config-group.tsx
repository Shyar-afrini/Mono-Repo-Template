"use client";

import {
  Container,
  Flex,
  Input,
  Label,
  LocalizedText,
  Switch,
  Text,
  Button,
} from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface FastPayConfigGroupProps {
  enabled: boolean;
  storeId: string;
  password: string;
  onEnabledChange: (enabled: boolean) => void;
  onStoreIdChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  disabled?: boolean;
  storeIdError?: string;
  passwordError?: string;
}

const FastPayConfigGroup = ({
  enabled,
  storeId,
  password,
  onEnabledChange,
  onStoreIdChange,
  onPasswordChange,
  disabled = false,
  storeIdError,
  passwordError,
}: FastPayConfigGroupProps) => {
  const t = useTranslations("settings.tabs.systemConfig");
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <Container className="rounded-lg border border-border/40 dark:bg-zinc-900/40 bg-zinc-100 p-4">
      <Flex direction="col" gap={4}>
        {/* FastPay Enabled Switch */}
        <Flex direction="row" align="center" justify="between" gap={4}>
          <Flex direction="col" gap={1} className="flex-1">
            <Label
              htmlFor="fastpay-enabled"
              className="text-sm font-medium cursor-pointer"
            >
              <LocalizedText text={t("configs.fastpay-enabled.title")} />
            </Label>
            <Text className="text-xs text-muted-foreground">
              <LocalizedText text={t("configs.fastpay-enabled.description")} />
            </Text>
          </Flex>
          <Switch
            id="fastpay-enabled"
            checked={enabled}
            onCheckedChange={onEnabledChange}
            disabled={disabled}
          />
        </Flex>

        {/* FastPay Input Fields - Shown when enabled */}
        {enabled && (
          <Flex direction="col" gap={3} className="mt-2">
            {/* Store ID */}
            <Flex direction="col" gap={2}>
              <Label
                htmlFor="fastpay-store-id"
                className={
                  storeIdError
                    ? "text-sm font-medium text-destructive"
                    : "text-sm font-medium"
                }
              >
                <LocalizedText text={t("configs.fastpay-store-id.title")} />
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="fastpay-store-id"
                type="text"
                value={storeId}
                onChange={(e) => onStoreIdChange(e.target.value)}
                placeholder={t("configs.fastpay-store-id.placeholder")}
                disabled={disabled}
                className={
                  storeIdError
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }
              />
              {storeIdError && (
                <Text className="text-xs text-destructive">
                  <LocalizedText text={storeIdError} />
                </Text>
              )}
            </Flex>

            {/* Store Password */}
            <Flex direction="col" gap={2}>
              <Label
                htmlFor="fastpay-store-password"
                className={
                  passwordError
                    ? "text-sm font-medium text-destructive"
                    : "text-sm font-medium"
                }
              >
                <LocalizedText
                  text={t("configs.fastpay-store-password.title")}
                />
                <span className="text-destructive ml-1">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="fastpay-store-password"
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder={t("configs.fastpay-store-password.placeholder")}
                  disabled={disabled}
                  className={
                    passwordError
                      ? "border-destructive focus-visible:ring-destructive pr-10"
                      : "pr-10"
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setPasswordVisible((prev) => !prev)}
                  className="absolute inset-y-0 end-0 me-1 text-muted-foreground hover:text-foreground p-1.5 hover:bg-transparent"
                  aria-label={
                    passwordVisible ? "Hide password" : "Show password"
                  }
                >
                  {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              {passwordError && (
                <Text className="text-xs text-destructive">
                  <LocalizedText text={passwordError} />
                </Text>
              )}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Container>
  );
};

export default FastPayConfigGroup;
