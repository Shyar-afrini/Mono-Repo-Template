"use client";

import {
  Container,
  Flex,
  Label,
  LocalizedText,
  Switch,
  Text,
} from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";
import type { AppConfig } from "../types/system-config.types";

interface ConfigSwitchProps {
  config: AppConfig;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ConfigSwitch = ({
  config,
  checked,
  onCheckedChange,
  disabled = false,
}: ConfigSwitchProps) => {
  const t = useTranslations("settings.tabs.systemConfig");
  const configTitleKey = `configs.${config.title}.title` as any;
  const configDescKey = `configs.${config.title}.description` as any;

  return (
    <Container className="rounded-lg border border-border/40 dark:bg-zinc-900/40 bg-zinc-100 p-4">
      <Flex direction="row" align="center" justify="between" gap={4}>
        <Flex direction="col" gap={1} className="flex-1">
          <Label
            htmlFor={`config-${config.id}`}
            className="text-sm font-medium cursor-pointer"
          >
            <LocalizedText text={t(configTitleKey)} />
          </Label>
          <Text className="text-xs text-muted-foreground">
            <LocalizedText text={t(configDescKey)} />
          </Text>
        </Flex>
        <Switch
          id={`config-${config.id}`}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </Flex>
    </Container>
  );
};

export default ConfigSwitch;
