"use client";

import {
  Container,
  Flex,
  Grid,
  LocalizedText,
  Text,
  Title,
} from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";
import { Bell, Mail, MessageSquare, Volume2 } from "lucide-react";
import { useState } from "react";
import { NotificationSoundSelectorModal } from "@/components/settings/notification-sound-selector-modal";
import { getNotificationSoundPreference } from "@/utils/notification-sound-preference";

const NotificationSettings = () => {
  const t = useTranslations("settings.tabs.notifications");
  const [soundModalOpen, setSoundModalOpen] = useState(false);
  const selectedSound = getNotificationSoundPreference();

  const notificationTypes = [
    {
      icon: Bell,
      label: t("types.email.label"),
      description: t("types.email.description"),
    },
    {
      icon: Mail,
      label: t("types.push.label"),
      description: t("types.push.description"),
    },
    {
      icon: MessageSquare,
      label: t("types.sms.label"),
      description: t("types.sms.description"),
    },
  ];

  // Extract sound number from path (e.g., "/assets/sounds/01.mp3" -> "01")
  const getSoundNumber = (soundPath: string): string => {
    const match = soundPath.match(/\/(\d+)\.mp3$/);
    return match ? match[1] : "01";
  };

  return (
    <>
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
            {/* Notification Sound Selection */}
            <Container className="rounded-lg border dark:border-border/40 border-zinc-200/40 dark:bg-card bg-white p-4 w-full">
              <Flex direction="col" gap={3}>
                <Text className="text-sm font-medium dark:text-foreground text-zinc-900">
                  <LocalizedText text={t("sound.label")} />
                </Text>
                <Text className="text-xs dark:text-muted-foreground text-zinc-600">
                  <LocalizedText text={t("sound.description")} />
                </Text>
                <Container
                  onClick={() => setSoundModalOpen(true)}
                  className="rounded-lg border dark:border-border/40 border-zinc-200/40 p-4 cursor-pointer dark:hover:bg-zinc-800/50 hover:bg-zinc-200/50 transition-colors w-full"
                >
                  <Flex direction="row" align="center" gap={3}>
                    <Volume2
                      size={20}
                      className="dark:text-muted-foreground text-zinc-600"
                    />
                    <Flex direction="col" gap={0.5} className="flex-1">
                      <Text className="text-sm font-medium dark:text-foreground text-zinc-900">
                        {t("sound.selected", {
                          number: getSoundNumber(selectedSound),
                        })}
                      </Text>
                      <Text className="text-xs dark:text-muted-foreground text-zinc-600">
                        {t("sound.clickToChange")}
                      </Text>
                    </Flex>
                  </Flex>
                </Container>
              </Flex>
            </Container>

            {/* Notification Channels */}
            <Container className="rounded-lg border dark:border-border/40 border-zinc-200/40 dark:bg-card bg-white p-4 w-full">
              <Flex direction="col" gap={3}>
                <Text className="text-sm font-medium dark:text-foreground text-zinc-900">
                  <LocalizedText text={t("notificationChannels.label")} />
                </Text>
                <Text className="text-xs dark:text-muted-foreground text-zinc-600">
                  <LocalizedText text={t("notificationChannels.description")} />
                </Text>
                <Grid
                  cols={3}
                  gap={3}
                  className="w-full xl:grid-cols-3 lg:grid-cols-2 grid-cols-1"
                >
                  {notificationTypes.map((type, index) => {
                    const Icon = type.icon;
                    return (
                      <Container
                        key={index}
                        className="rounded-lg border dark:border-border/40 border-zinc-200/40 p-4 w-full"
                      >
                        <Flex direction="row" align="center" gap={3}>
                          <Icon
                            size={20}
                            className="dark:text-muted-foreground text-zinc-600"
                          />
                          <Flex direction="col" gap={0.5} className="flex-1">
                            <Text className="text-sm font-medium dark:text-foreground text-zinc-900">
                              {type.label}
                            </Text>
                            <Text className="text-xs dark:text-muted-foreground text-zinc-600">
                              {type.description}
                            </Text>
                          </Flex>
                        </Flex>
                      </Container>
                    );
                  })}
                </Grid>
              </Flex>
            </Container>
          </Flex>
        </Flex>
      </Container>

      <NotificationSoundSelectorModal
        open={soundModalOpen}
        onOpenChange={setSoundModalOpen}
      />
    </>
  );
};

export default NotificationSettings;
