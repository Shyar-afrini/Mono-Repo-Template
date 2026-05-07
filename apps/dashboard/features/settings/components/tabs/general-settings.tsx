"use client";

import {
  Container,
  Flex,
  LocalizedText,
  Text,
  Title,
} from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";
import { Clock, Database, Shield } from "lucide-react";

const GeneralSettings = () => {
  const t = useTranslations("settings.tabs.general");

  const settings = [
    {
      icon: Clock,
      label: t("items.timezone.label"),
      description: t("items.timezone.description"),
      value: "UTC",
    },
    {
      icon: Database,
      label: t("items.dataRetention.label"),
      description: t("items.dataRetention.description"),
      value: "90 days",
    },
    {
      icon: Shield,
      label: t("items.security.label"),
      description: t("items.security.description"),
      value: "Enabled",
    },
  ];

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

        <Flex direction="col" gap={4}>
          {settings.map((setting, index) => {
            const Icon = setting.icon;
            return (
              <Container
                key={index}
                className="rounded-lg border dark:border-border/40 border-zinc-200/40 dark:bg-card bg-white p-4 w-full"
              >
                <Flex direction="row" align="center" justify="between" gap={3}>
                  <Flex
                    direction="row"
                    align="center"
                    gap={3}
                    className="flex-1"
                  >
                    <Icon
                      size={20}
                      className="dark:text-muted-foreground text-zinc-600"
                    />
                    <Flex direction="col" gap={0.5}>
                      <Text className="text-sm font-medium dark:text-foreground text-zinc-900">
                        {setting.label}
                      </Text>
                      <Text className="text-xs dark:text-muted-foreground text-zinc-600">
                        {setting.description}
                      </Text>
                    </Flex>
                  </Flex>
                  <Text className="text-sm dark:text-muted-foreground text-zinc-600">
                    {setting.value}
                  </Text>
                </Flex>
              </Container>
            );
          })}
        </Flex>
      </Flex>
    </Container>
  );
};

export default GeneralSettings;
