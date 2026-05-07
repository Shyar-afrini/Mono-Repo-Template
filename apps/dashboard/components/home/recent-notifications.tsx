"use client";

import { createAdminNotificationsClient } from "@/features/notifications/domains/admin-notifications/services/admin-notifications.client";
import useNotificationModalStore from "@/features/notifications/domains/admin-notifications/store/notification-modal.store";
import { Link } from "@/i18n/navigation";
import {
  AnimatedButton,
  Badge,
  Container,
  EmptyDataHandler,
  FetchErrorHandler,
  Flex,
  LocalizedText,
  ScrollArea,
  ScrollBar,
  SkeletonLoadingHandler,
  Text,
} from "@mono-repo-template/ui";
import { formatDistanceToNow } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";
import { Bell, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import { AdminNotification } from "@/features/notifications/domains/admin-notifications/types/admin-notification.types";
import { DATA_PAGINATION_CONSTANTS } from "@mono-repo-template/common";
import { PermissionGate } from "@mono-repo-template/permissions";

// Custom placeholder components for home page context
const CustomErrorComponent = () => {
  const t = useTranslations("home.recentNotifications");
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={2}
      className="py-8"
    >
      <Bell size={32} className="text-muted-foreground" />
      <Text className="text-sm text-muted-foreground text-center">
        <LocalizedText text={t("error")} />
      </Text>
    </Flex>
  );
};

const CustomLoadingSkeleton = () => (
  <Flex direction="column" gap={2}>
    {[1, 2, 3].map((i) => (
      <Flex
        key={i}
        direction="row"
        align="center"
        gap={3}
        className="p-3 animate-pulse"
      >
        <div className="h-10 w-10 rounded-xl dark:bg-zinc-800 bg-zinc-200" />
        <Flex direction="column" gap={1} className="flex-1">
          <div className="h-4 w-32 dark:bg-zinc-800 bg-zinc-200 rounded" />
          <div className="h-3 w-24 dark:bg-zinc-800 bg-zinc-200 rounded" />
        </Flex>
      </Flex>
    ))}
  </Flex>
);

const CustomEmptyDataComponent = () => {
  const t = useTranslations("home.recentNotifications");
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={2}
      className="py-8 mt-8"
    >
      <Bell size={32} className="dark:text-muted-foreground text-zinc-600" />
      <Text className="text-sm dark:text-muted-foreground text-zinc-600 text-center">
        <LocalizedText text={t("empty")} />
      </Text>
      <Text className="text-xs dark:text-muted-foreground text-zinc-600 text-center">
        <LocalizedText text={t("emptyDescription")} />
      </Text>
    </Flex>
  );
};

const RecentNotifications = () => {
  const t = useTranslations("home.recentNotifications");
  const tTypes = useTranslations("adminNotifications.types");
  const tActions = useTranslations("adminNotifications.actions");
  const locale = useLocale();
  const localeObj = locale === "ar" ? arLocale : enUS;
  const { openModal } = useNotificationModalStore();

  const adminNotificationsClient = useMemo(
    () => createAdminNotificationsClient(),
    []
  );
  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = adminNotificationsClient.useGetCurrentNotificationsInfinite(
    DATA_PAGINATION_CONSTANTS.RECENT_NOTIFICATIONS_LIMIT,
    "createdAt:desc"
  );

  // Flatten all pages into a single array
  const notifications = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => {
      // Each page is PaginationConstruct<AdminNotification[]>
      // Extract the data array from each page
      return Array.isArray(page?.data) ? page.data : [];
    });
  }, [data]);

  // Infinite scroll observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const formatTimestamp = (timestamp: string): string => {
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

  const getNotificationMessage = (notification: AdminNotification): string => {
    const actionText = tActions(notification.action);
    const typeText = tTypes(notification.type);

    if (locale === "ar") {
      return `${notification.sender.fullname} ${actionText} ${typeText}`;
    }
    return `${notification.sender.fullname} ${actionText} a ${typeText}`;
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };

  return (
    <PermissionGate permissions={["notification:read"]}>
      <Container className="w-full h-full dark:bg-zinc-900 bg-zinc-50 rounded-xl p-6 flex flex-col">
        <Flex direction="column" gap={4} className="flex-1">
          <Flex direction="row" align="center" justify="between">
            <Text className="text-base font-semibold dark:text-foreground text-zinc-600">
              <LocalizedText text={t("title")} />
            </Text>
            <Link href="/dashboard/notifications">
              <AnimatedButton variant="secondary" size="sm">
                <LocalizedText
                  className="dark:text-zinc-300 text-zinc-600 text-xs"
                  text={t("viewAll")}
                />
              </AnimatedButton>
            </Link>
          </Flex>

          <ScrollArea className="max-h-[250px] rounded-xl">
            <FetchErrorHandler
              isError={isError}
              customErrorComponent={<CustomErrorComponent />}
            >
              <SkeletonLoadingHandler
                isLoading={isPending}
                customSkeleton={<CustomLoadingSkeleton />}
              >
                <EmptyDataHandler
                  isEmpty={notifications.length === 0 && !isPending}
                  customEmptyDataComponent={<CustomEmptyDataComponent />}
                >
                  <Flex direction="column" gap={2}>
                    {notifications.map((notification) => {
                      const message = getNotificationMessage(notification);
                      return (
                        <AnimatedButton
                          key={notification.id}
                          variant="ghost"
                          className="w-full justify-start gap-3 p-3 h-auto"
                          onClick={() => openModal(notification)}
                        >
                          <Flex
                            direction="row"
                            align="center"
                            justify="center"
                            className="p-3 dark:bg-linear-to-tl dark:from-zinc-700/60 dark:to-zinc-800/60 bg-linear-to-tl from-zinc-200/60 to-zinc-300/60 rounded-xl"
                          >
                            <Bell
                              size={18}
                              className="dark:text-foreground text-zinc-600"
                            />
                          </Flex>
                          <Flex
                            direction="column"
                            align="start"
                            gap={1}
                            className="flex-1 min-w-0"
                          >
                            <Flex
                              direction="row"
                              align="center"
                              gap={2}
                              className="w-full"
                            >
                              <Text className="text-sm text-start font-medium dark:text-foreground text-zinc-600 truncate flex-1">
                                {truncateText(message, 40)}
                              </Text>
                              <Badge variant="secondary" className="text-xs">
                                <LocalizedText text={tTypes(notification.type)} />
                              </Badge>
                            </Flex>
                            <Flex direction="row" align="center" gap={1}>
                              <Clock
                                size={12}
                                className="text-muted-foreground"
                              />
                              <Text className="text-xs dark:text-muted-foreground text-zinc-600">
                                {formatTimestamp(notification.createdAt)}
                              </Text>
                            </Flex>
                          </Flex>
                        </AnimatedButton>
                      );
                    })}
                    {/* Infinite scroll trigger */}
                    {hasNextPage && (
                      <div ref={observerTarget} className="h-4 w-full" />
                    )}
                    {/* Loading indicator for next page */}
                    {isFetchingNextPage && (
                      <Flex
                        direction="row"
                        align="center"
                        gap={3}
                        className="p-3 animate-pulse"
                      >
                        <div className="h-10 w-10 rounded-xl dark:bg-zinc-800 bg-zinc-200" />
                        <Flex direction="column" gap={1} className="flex-1">
                          <div className="h-4 w-32 dark:bg-zinc-800 bg-zinc-200 rounded" />
                          <div className="h-3 w-24 dark:bg-zinc-800 bg-zinc-200 rounded" />
                        </Flex>
                      </Flex>
                    )}
                  </Flex>
                </EmptyDataHandler>
              </SkeletonLoadingHandler>
            </FetchErrorHandler>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </Flex>
      </Container>
    </PermissionGate>
  );
};

export default RecentNotifications;
