"use client";

import {
  Container,
  Flex,
  LocalizedText,
  Text,
  Title,
  Skeleton,
  FetchErrorHandler,
  SkeletonLoadingHandler,
  EmptyDataHandler,
} from "@mono-repo-template/ui";
import { useTranslations, useLocale } from "next-intl";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { createAuthClient } from "@mono-repo-template/auth";
import { format } from "date-fns";
import { ar as arLocale, enUS } from "date-fns/locale";

const AccountSettings = () => {
  const t = useTranslations("settings.tabs.account");
  const locale = useLocale();
  const authClient = createAuthClient();
  const { data: currentUser, isPending, isError } = authClient.getCurrentUser();

  const formatMemberSince = (dateString: string | null | undefined): string => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return "-";
      const localeObj = locale === "ar" ? arLocale : enUS;
      return format(date, "MMMM yyyy", { locale: localeObj });
    } catch {
      return "-";
    }
  };

  const accountInfo = currentUser
    ? [
        {
          icon: User,
          label: t("info.fullName.label"),
          value: currentUser.fullname || "-",
        },
        {
          icon: Mail,
          label: t("info.email.label"),
          value: currentUser.email || "-",
        },
        {
          icon: Calendar,
          label: t("info.memberSince.label"),
          value: formatMemberSince(currentUser.createdAt?.toString()),
        },
        {
          icon: Shield,
          label: t("info.role.label"),
          value: currentUser.role?.name || "-",
        },
      ]
    : [];

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

        <FetchErrorHandler isError={isError}>
          <SkeletonLoadingHandler
            isLoading={isPending}
            customSkeleton={
              <Container className="rounded-lg border dark:border-border/40 border-zinc-200/40 dark:bg-card bg-white p-4 w-full">
                <Flex direction="col" gap={3}>
                  <Skeleton className="h-4 w-32 dark:bg-zinc-800 bg-zinc-300" />
                  <Flex direction="col" gap={2} className="mt-2 w-full">
                    {[1, 2, 3, 4].map((i) => (
                      <Container
                        key={i}
                        className="rounded-lg border dark:border-border/40 border-zinc-200/40 p-3 w-full"
                      >
                        <Flex
                          direction="row"
                          align="center"
                          justify="between"
                          gap={3}
                        >
                          <Flex direction="row" align="center" gap={3}>
                            <Skeleton className="h-[18px] w-[18px] rounded dark:bg-zinc-800 bg-zinc-300" />
                            <Skeleton className="h-4 w-24 rounded dark:bg-zinc-800 bg-zinc-300" />
                          </Flex>
                          <Skeleton className="h-4 w-32 rounded dark:bg-zinc-800 bg-zinc-300" />
                        </Flex>
                      </Container>
                    ))}
                  </Flex>
                </Flex>
              </Container>
            }
          >
            <EmptyDataHandler isEmpty={!currentUser}>
              <Flex direction="col" gap={4}>
                <Container className="rounded-lg border dark:border-border/40 border-zinc-200/40 dark:bg-card bg-white p-4 w-full">
                  <Flex direction="col" gap={3}>
                    <Text className="text-sm font-medium dark:text-foreground text-zinc-900">
                      <LocalizedText text={t("accountInformation.label")} />
                    </Text>
                    <Flex direction="col" gap={2} className="mt-2 w-full">
                      {accountInfo.map((info) => {
                        const Icon = info.icon;
                        return (
                          <Container
                            key={info.label}
                            className="rounded-lg border dark:border-border/40 border-zinc-200/40 p-3 w-full"
                          >
                            <Flex
                              direction="row"
                              align="center"
                              justify="between"
                              gap={3}
                            >
                              <Flex direction="row" align="center" gap={3}>
                                <Icon
                                  size={18}
                                  className="dark:text-muted-foreground text-zinc-600"
                                />
                                <Text className="text-sm font-medium dark:text-foreground text-zinc-900">
                                  {info.label}
                                </Text>
                              </Flex>
                              <Text className="text-sm dark:text-muted-foreground text-zinc-600">
                                {info.value}
                              </Text>
                            </Flex>
                          </Container>
                        );
                      })}
                    </Flex>
                  </Flex>
                </Container>
              </Flex>
            </EmptyDataHandler>
          </SkeletonLoadingHandler>
        </FetchErrorHandler>
      </Flex>
    </Container>
  );
};

export default AccountSettings;
