"use client";

import {
  Container,
  Flex,
  LocalizedText,
  Text,
  AnimatedButton,
  ScrollArea,
  ScrollBar,
} from "@mono-repo-template/ui";
import { getRecentHistory, clearHistory } from "@/utils/navigation-history";
import { getPageMetadata } from "@/utils/navigation-metadata";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatDistanceToNow } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import { Clock, Trash2 } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { createAuthClient } from "@mono-repo-template/auth";

const RecentActivity = () => {
  const t = useTranslations("home.recentActivity");
  const tSidebar = useTranslations("sidebar");
  const locale = useLocale();
  const localeObj = locale === "ar" ? arLocale : enUS;
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const authClient = createAuthClient();
  const { data: currentUser } = authClient.getCurrentUser();

  // Get recent history from localStorage
  const recentHistory = useMemo(() => {
    return getRecentHistory(5, currentUser?.id);
  }, [refreshKey, currentUser?.id]);

  // Get metadata for each history item
  const historyWithMetadata = useMemo(() => {
    return recentHistory.map((item) => {
      const metadata = getPageMetadata(item.path, tSidebar);
      return {
        ...item,
        title: metadata?.title || item.title,
        icon: metadata?.icon || undefined,
      };
    });
  }, [recentHistory, tSidebar]);

  const formatTimestamp = (timestamp: number): string => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: localeObj,
      });
    } catch {
      return "";
    }
  };

  const handleClearClick = useCallback(() => {
    if (needsConfirmation) {
      // Second click - confirm and clear
      clearHistory(currentUser?.id);
      setRefreshKey((prev) => prev + 1);
      setNeedsConfirmation(false);
    } else {
      // First click - show confirmation
      setNeedsConfirmation(true);
      // Reset after 2 seconds
      setTimeout(() => {
        setNeedsConfirmation(false);
      }, 2000);
    }
  }, [needsConfirmation, currentUser?.id]);

  // Listen for history changes
  useEffect(() => {
    const handleHistoryChange = () => {
      setRefreshKey((prev) => prev + 1);
    };

    if (globalThis.window) {
      globalThis.window.addEventListener(
        "history-changed",
        handleHistoryChange
      );
      return () => {
        globalThis.window?.removeEventListener(
          "history-changed",
          handleHistoryChange
        );
      };
    }
  }, []);

  if (historyWithMetadata.length === 0) {
    return (
      <Container className="w-full h-full dark:bg-zinc-900 bg-zinc-50 rounded-xl p-6 flex flex-col">
        <Flex direction="column" gap={4} className="flex-1 justify-start">
          <Text className="text-base font-semibold dark:text-foreground text-zinc-600">
            <LocalizedText text={t("title")} />
          </Text>
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap={2}
            className="py-8 mt-8"
          >
            <Clock size={32} className="text-muted-foreground" />
            <Text className="text-sm dark:text-muted-foreground text-zinc-600 text-center">
              <LocalizedText text={t("empty")} />
            </Text>
            <Text className="text-xs dark:text-muted-foreground text-zinc-600 text-center">
              <LocalizedText text={t("emptyDescription")} />
            </Text>
          </Flex>
        </Flex>
      </Container>
    );
  }

  return (
    <Container className="w-full h-full dark:bg-zinc-900 bg-zinc-50 rounded-2xl p-6 flex flex-col">
      <Flex direction="column" gap={4} className="flex-1">
        <Flex direction="row" align="center" justify="between" gap={2}>
          <Text className="text-base font-semibold dark:text-foreground text-zinc-600">
            <LocalizedText text={t("title")} />
          </Text>
          <AnimatedButton
            variant="ghost"
            size="sm"
            onClick={handleClearClick}
            className={
              needsConfirmation
                ? "dark:text-destructive text-zinc-600"
                : "dark:text-muted-foreground text-zinc-600"
            }
          >
            <Trash2 size={14} className="mr-1.5" />
            <span className="text-xs dark:text-zinc-300 text-zinc-600">
              {needsConfirmation ? (
                <LocalizedText text={t("confirmClear")} />
              ) : (
                <LocalizedText text={t("clear")} />
              )}
            </span>
          </AnimatedButton>
        </Flex>
        <ScrollArea className="max-h-[250px] rounded-xl">
          <Flex direction="column" gap={2}>
            {historyWithMetadata
              .filter((item) => item.path !== "/dashboard/home")
              .map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link key={`${item.path}-${item.timestamp}`} href={item.path}>
                    <AnimatedButton
                      variant="ghost"
                      className="w-full justify-start gap-3 p-3 h-auto"
                    >
                      {IconComponent && (
                        <Flex
                          direction="row"
                          align="center"
                          justify="center"
                          className="p-3 dark:bg-linear-to-tl dark:from-zinc-700/60 dark:to-zinc-800/60 bg-linear-to-tl from-zinc-200/60 to-zinc-300/60 rounded-xl"
                        >
                          <IconComponent
                            size={18}
                            className="dark:text-foreground text-zinc-600"
                          />
                        </Flex>
                      )}
                      <Flex
                        direction="column"
                        align="start"
                        gap={1}
                        className="flex-1 min-w-0"
                      >
                        <Text className="text-sm font-medium text-foreground truncate w-full text-start">
                          {item.title}
                        </Text>
                        <Flex direction="row" align="center" gap={1}>
                          <Clock className="text-muted-foreground size-3!" />
                          <Text className="text-xs text-muted-foreground">
                            {formatTimestamp(item.timestamp)}
                          </Text>
                        </Flex>
                      </Flex>
                    </AnimatedButton>
                  </Link>
                );
              })}
          </Flex>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </Flex>
    </Container>
  );
};

export default RecentActivity;
