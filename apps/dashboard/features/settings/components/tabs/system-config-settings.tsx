"use client";

import {
  Container,
  Flex,
  LocalizedText,
  Text,
  Title,
} from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";
import SystemConfigContent from "@/features/settings/domains/system-config/components/system-config-content";

const SystemConfigSettings = () => {
  const t = useTranslations("settings.tabs.systemConfig");

  return (
    <Container className="p-6">
      <Flex direction="col" gap={6}>
        <Flex direction="col" gap={1}>
          <Title level={2} className="text-xl font-semibold">
            <LocalizedText text={t("title")} />
          </Title>
          <Text className="text-sm dark:text-muted-foreground text-zinc-600">
            <LocalizedText text={t("description")} />
          </Text>
        </Flex>
        <SystemConfigContent />
      </Flex>
    </Container>
  );
};

export default SystemConfigSettings;
