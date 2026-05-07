"use client";

import {
  Container,
  Flex,
  LocalizedText,
  Text,
  AnimatedButton,
  Skeleton,
  FetchErrorHandler,
  SkeletonLoadingHandler,
  EmptyDataHandler,
} from "@mono-repo-template/ui";
import { createAuthClient } from "@mono-repo-template/auth";
import { useTranslations } from "next-intl";
import { getDayTimeStatus } from "@mono-repo-template/utils";
import { Link } from "@/i18n/navigation";
import { User, Settings } from "lucide-react";

const WelcomeMessage = () => {
  const t = useTranslations("home.welcome");
  const authClient = createAuthClient();
  const { data: currentUser, isPending, isError } = authClient.getCurrentUser();

  const dayTimeStatus = getDayTimeStatus();
  const dayTimeKey = `mainPage.${dayTimeStatus.code}`;
  const tMainPage = useTranslations("mainPage");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dayTime = tMainPage(dayTimeKey as any);

  if (isError) {
    return (
      <Container className="w-full bg-zinc-900 rounded-xl p-6">
        <FetchErrorHandler isError={isError}>
          <Container />
        </FetchErrorHandler>
      </Container>
    );
  }

  if (isPending) {
    return (
      <Container className="w-full bg-zinc-900 rounded-xl p-6">
        <SkeletonLoadingHandler isLoading={isPending}>
          <Flex direction="row" align="center" gap={4}>
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Flex direction="column" gap={2} className="flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </Flex>
          </Flex>
        </SkeletonLoadingHandler>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container className="w-full bg-zinc-900 rounded-xl p-6">
        <EmptyDataHandler isEmpty={true}>
          <Container />
        </EmptyDataHandler>
      </Container>
    );
  }

  const userName = currentUser.fullname || "User";
  const roleName = currentUser.role?.name || null;

  return (
    <Container className="w-full bg-zinc-900 rounded-xl p-6">
      <Flex direction="column" gap={4}>
        {/* Greeting and User Name */}
        <Flex direction="row" align="center" gap={4}>
          <Flex
            direction="row"
            align="center"
            justify="center"
            className="p-2 bg-linear-to-tl from-zinc-700/60 to-zinc-800/60 rounded-xl"
          >
            <User size={20} className="text-foreground" />
          </Flex>
          <Flex direction="column" gap={1} className="flex-1">
            <Text className="text-xl font-bold text-foreground">
              <LocalizedText
                text={t("greeting", {
                  dayTime,
                  name: userName,
                })}
              />
            </Text>
            {roleName && (
              <Text className="text-sm text-muted-foreground">
                <LocalizedText text={t("role", { role: roleName })} />
              </Text>
            )}
          </Flex>
        </Flex>

        {/* Quick Actions */}
        <Flex direction="row" gap={2} align="center">
          <Link href="/dashboard/settings?tab=account">
            <AnimatedButton variant="outline" size="sm" className="gap-2">
              <Flex
                direction="row"
                align="center"
                justify="center"
                className="p-1.5 bg-linear-to-tl from-zinc-700/60 to-zinc-800/60 rounded-lg"
              >
                <User size={14} className="text-foreground" />
              </Flex>
              <LocalizedText text={t("viewProfile")} />
            </AnimatedButton>
          </Link>
          <Link href="/dashboard/settings">
            <AnimatedButton variant="outline" size="sm" className="gap-2">
              <Flex
                direction="row"
                align="center"
                justify="center"
                className="p-1.5 bg-linear-to-tl from-zinc-700/60 to-zinc-800/60 rounded-lg"
              >
                <Settings size={14} className="text-foreground" />
              </Flex>
              <LocalizedText text={t("openSettings")} />
            </AnimatedButton>
          </Link>
        </Flex>
      </Flex>
    </Container>
  );
};

export default WelcomeMessage;
