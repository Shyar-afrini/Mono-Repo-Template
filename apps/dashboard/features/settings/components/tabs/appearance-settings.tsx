"use client";

import {
  AnimatedButton,
  Container,
  Flex,
  Grid,
  LocalizedText,
  Text,
  Title,
} from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";
import { Moon, Sun, Monitor, PanelLeft, Sidebar } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  useSidebarVariant,
  type SidebarVariant,
} from "@/contexts/sidebar-variant-context";

const AppearanceSettings = () => {
  const t = useTranslations("settings.tabs.appearance");
  const { theme, setTheme } = useTheme();
  const {
    variant: sidebarVariant,
    setVariant: setSidebarVariant,
    mounted: sidebarMounted,
  } = useSidebarVariant();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themes = [
    {
      value: "light" as const,
      icon: Sun,
      label: t("theme.light"),
    },
    {
      value: "dark" as const,
      icon: Moon,
      label: t("theme.dark"),
    },
    {
      value: "system" as const,
      icon: Monitor,
      label: t("theme.system"),
    },
  ];

  const sidebarVariants: Array<{
    value: SidebarVariant;
    icon: typeof Sidebar;
    label: string;
  }> = [
    {
      value: "sidebar",
      icon: Sidebar,
      label: t("sidebarStyle.sidebar"),
    },
    {
      value: "floating",
      icon: Sidebar,
      label: t("sidebarStyle.floating"),
    },
    {
      value: "inset",
      icon: PanelLeft,
      label: t("sidebarStyle.inset"),
    },
  ];

  if (!mounted) {
    return (
      <Container className="p-6 w-full">
        <Flex direction="col" gap={6}>
          <Flex direction="col" gap={1}>
            <Title level={2} className="text-xl font-semibold">
              <LocalizedText text={t("title")} />
            </Title>
            <Text className="text-sm dark:text-muted-foreground text-zinc-600">
              <LocalizedText text={t("description")} />
            </Text>
          </Flex>
          <Container className="rounded-lg border dark:border-border/40 border-zinc-200/40 dark:bg-card bg-zinc-50 p-4 w-full">
            <Grid
              cols={3}
              gap={3}
              className="w-full xl:grid-cols-3 lg:grid-cols-2 grid-cols-1"
            >
              {themes.map((themeOption) => {
                const Icon = themeOption.icon;
                return (
                  <Container
                    key={themeOption.value}
                    className="flex-1 w-full rounded-lg border dark:border-border/40 border-zinc-200/40 p-4"
                  >
                    <Flex
                      direction="col"
                      align="center"
                      gap={2}
                      className="w-full"
                    >
                      <Icon
                        size={24}
                        className="dark:text-muted-foreground text-zinc-600"
                      />
                      <Text className="text-sm font-medium dark:text-foreground text-zinc-900">
                        <LocalizedText text={themeOption.label} />
                      </Text>
                    </Flex>
                  </Container>
                );
              })}
            </Grid>
          </Container>
        </Flex>
      </Container>
    );
  }

  return (
    <Container className="p-6">
      <Flex direction="col" gap={6}>
        <Flex direction="col" gap={1}>
          <Title level={2} className="text-xl font-semibold">
            <LocalizedText text={t("title")} />
          </Title>
          <Text className="text-sm text-muted-foreground">
            <LocalizedText text={t("description")} />
          </Text>
        </Flex>

        <Flex direction="col" gap={4}>
          <Container className="rounded-lg border border-border/40 bg-card p-4">
            <Flex direction="col" gap={3}>
              <Text className="text-sm font-medium">
                <LocalizedText text={t("theme.label")} />
              </Text>
              <Text className="text-xs dark:text-muted-foreground text-zinc-600">
                <LocalizedText text={t("theme.description")} />
              </Text>
              <Grid
                cols={3}
                gap={3}
                className="w-full xl:grid-cols-3 lg:grid-cols-2 grid-cols-1"
              >
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isActive = theme === themeOption.value;
                  return (
                    <AnimatedButton
                      key={themeOption.value}
                      variant={isActive ? "default" : "outline"}
                      className="flex-1 w-full flex flex-col items-center gap-2 p-4 h-auto"
                      onClick={() => setTheme(themeOption.value)}
                    >
                      <Icon
                        size={24}
                        className={
                          isActive
                            ? "text-primary-foreground"
                            : "dark:text-muted-foreground text-zinc-600"
                        }
                      />
                      <Text
                        className={`text-sm font-medium ${
                          isActive
                            ? "text-primary-foreground"
                            : "dark:text-foreground text-zinc-900"
                        }`}
                      >
                        <LocalizedText text={themeOption.label} />
                      </Text>
                    </AnimatedButton>
                  );
                })}
              </Grid>
            </Flex>
          </Container>

          {/* Sidebar Style Section */}
          <Container className="rounded-lg border border-border/40 bg-card p-4">
            <Flex direction="col" gap={3}>
              <Text className="text-sm font-medium">
                <LocalizedText text={t("sidebarStyle.label")} />
              </Text>
              <Text className="text-xs dark:text-muted-foreground text-zinc-600">
                <LocalizedText text={t("sidebarStyle.description")} />
              </Text>
              <Grid
                cols={3}
                gap={3}
                className="w-full xl:grid-cols-3 lg:grid-cols-2 grid-cols-1"
              >
                {sidebarVariants.map((variantOption) => {
                  const Icon = variantOption.icon;
                  const isActive =
                    sidebarMounted && sidebarVariant === variantOption.value;
                  return (
                    <AnimatedButton
                      key={variantOption.value}
                      variant={isActive ? "default" : "outline"}
                      className="flex-1 w-full flex flex-col items-center gap-2 p-4 h-auto"
                      onClick={() => setSidebarVariant(variantOption.value)}
                    >
                      <Icon
                        size={24}
                        className={
                          isActive
                            ? "text-primary-foreground"
                            : "dark:text-muted-foreground text-zinc-600"
                        }
                      />
                      <Text
                        className={`text-sm font-medium ${
                          isActive
                            ? "text-primary-foreground"
                            : "dark:text-foreground text-zinc-900"
                        }`}
                      >
                        <LocalizedText text={variantOption.label} />
                      </Text>
                    </AnimatedButton>
                  );
                })}
              </Grid>
            </Flex>
          </Container>
        </Flex>
      </Flex>
    </Container>
  );
};

export default AppearanceSettings;
