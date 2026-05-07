"use client";

import { usePermission } from "@mono-repo-template/permissions";
import {
  Flex,
  LocalizedText,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@mono-repo-template/ui";
import { cn } from "@mono-repo-template/utils";
import {
  Bell,
  Globe,
  Palette,
  User
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";
import AccountSettings from "./tabs/account-settings";
import AppearanceSettings from "./tabs/appearance-settings";
import GeneralSettings from "./tabs/general-settings";
import LanguageSettings from "./tabs/language-settings";
import NotificationSettings from "./tabs/notification-settings";
import SystemConfigSettings from "./tabs/system-config-settings";

const tabItems = [
  { value: "appearance", icon: Palette, labelKey: "appearance.title", permission: null },
  { value: "language", icon: Globe, labelKey: "language.title", permission: null },
  { value: "notifications", icon: Bell, labelKey: "notifications.title", permission: null },
  { value: "account", icon: User, labelKey: "account.title", permission: null },
] as const;

const triggerBaseClasses =
  "w-full justify-start gap-3 p-3 data-[state=active]:dark:bg-white data-[state=active]:bg-zinc-100 data-[state=active]:shadow-none data-[state=active]:text-primary-foreground data-[state=active]:bg-zinc-800 data-[state=active]:rounded-lg data-[state=inactive]:bg-transparent";

const validTabValues = new Set(tabItems.map((item) => item.value));
type TabValue = (typeof tabItems)[number]["value"];

const SettingsTabs = () => {
  const t = useTranslations("settings.tabs");
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasConfigWrite = usePermission("config:write");

  // Filter tabs based on permissions
  const visibleTabs = useMemo(() => {
    return tabItems.filter((tab) => {
      if (!tab.permission) return true;
      if (tab.permission === "config:write") return hasConfigWrite;
      return false;
    });
  }, [hasConfigWrite]);

  // Get valid tab values from visible tabs
  const validVisibleTabValues = useMemo(
    () => new Set(visibleTabs.map((tab) => tab.value)),
    [visibleTabs]
  );

  // Get active tab from URL or default to first visible tab
  const activeTabFromUrl = searchParams.get("tab");
  const activeTab = useMemo<TabValue>(() => {
    if (
      activeTabFromUrl &&
      validVisibleTabValues.has(activeTabFromUrl as TabValue)
    ) {
      return activeTabFromUrl as TabValue;
    }
    // Default to first visible tab
    return visibleTabs[0]?.value || "appearance";
  }, [activeTabFromUrl, visibleTabs, validVisibleTabValues]);

  // Redirect if active tab is not visible
  useEffect(() => {
    if (
      activeTabFromUrl &&
      !validVisibleTabValues.has(activeTabFromUrl as TabValue)
    ) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tab");
      router.replace(`?${params.toString()}`);
    }
  }, [activeTabFromUrl, validVisibleTabValues, searchParams, router]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const firstVisibleTab = visibleTabs[0]?.value || "appearance";
    if (value === firstVisibleTab) {
      // Remove tab param for default tab
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="mt-4 flex gap-6"
    >
      <TabsList className="flex flex-col gap-2 h-auto w-64 p-2 bg-transparent sticky top-4 self-start rtl:border-l ltr:border-r dark:border-border/40 border-zinc-200/40">
        {visibleTabs.map(({ value, icon: Icon, labelKey }) => (
          <TabsTrigger key={value} value={value} className={triggerBaseClasses}>
            <Icon
              size={18}
              className={cn(
                "dark:text-zinc-500",
                "data-[state=active]:text-primary-foreground"
              )}
            />
            <LocalizedText text={t(labelKey)} />
          </TabsTrigger>
        ))}
      </TabsList>
      <Flex direction="col" gap={2} className="flex-1">
        {visibleTabs.map(({ value }) => {
          switch (value) {
            case "appearance":
              return (
                <TabsContent key={value} value="appearance" className="mt-0">
                  <AppearanceSettings />
                </TabsContent>
              );
            case "language":
              return (
                <TabsContent key={value} value="language" className="mt-0">
                  <LanguageSettings />
                </TabsContent>
              );
            case "notifications":
              return (
                <TabsContent key={value} value="notifications" className="mt-0">
                  <NotificationSettings />
                </TabsContent>
              );
            case "account":
              return (
                <TabsContent key={value} value="account" className="mt-0">
                  <AccountSettings />
                </TabsContent>
              );
            default:
              return null;
          }
        })}
      </Flex>
    </Tabs>
  );
};

export default SettingsTabs;
