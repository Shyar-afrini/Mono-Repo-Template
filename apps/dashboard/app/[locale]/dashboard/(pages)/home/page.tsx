"use client";
import FavoritePages from "@/components/home/favorite-pages";
import PerformanceMetrics from "@/components/home/performance-metrics";
import QuickStatsWidget from "@/components/home/quick-stats-widget";
import RecentActivity from "@/components/home/recent-activity";
import RecentNotifications from "@/components/home/recent-notifications";
import SystemStatus from "@/components/home/system-status";
import PageContainer from "@/components/page-container";
import SiteHeader from "@/components/site-header";
import { AdminNotificationsPopover } from "@/features/notifications/domains/admin-notifications/components";
import { AnimatedContainer, Flex, Grid } from "@mono-repo-template/ui";
import { localeBasedDirection } from "@mono-repo-template/utils";
import { useLocale, useTranslations } from "next-intl";

const Home = () => {
  const t = useTranslations("home");
  const locale = useLocale();
  // animation variants for a staggered animation
  const variants = {
    initial: {
      opacity: 0,
      scale: 0.92,
      top: -10,
      left: localeBasedDirection(locale, "-10px", "10px"),
    },
    animate: {
      opacity: 1,
      scale: 1,
      top: 0,
      left: localeBasedDirection(locale, "0px", "0px"),
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      top: -10,
      left: localeBasedDirection(locale, "-10px", "10px"),
    },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 1.1,
    },
  };

  // widgets to be displayed in the home page
  const widgets = [
    {
      component: RecentActivity,
      className:
        "2xl:col-span-2 row-span-1 xl:col-span-2 lg:col-span-3 md:col-span-3 sm:col-span-2 w-full flex",
      id: "recent-activity",
    },
    {
      component: RecentNotifications,
      className:
        "2xl:col-span-2 row-span-1 xl:col-span-3 lg:col-span-4 md:col-span-3 sm:col-span-3 w-full flex",
      id: "recent-notifications",
    },
    {
      component: SystemStatus,
      className:
        "2xl:col-span-3 row-span-1 xl:col-span-3 flex lg:col-span-4 md:col-span-3 sm:col-span-3",
      id: "system-status",
    },
    {
      component: FavoritePages,
      className:
        "2xl:col-span-2 row-span-1 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-2 flex",
      id: "favorite-pages",
    },
    {
      component: PerformanceMetrics,
      className:
        "2xl:col-span-5 row-span-1 xl:col-span-5 lg:col-span-4 md:col-span-3 sm:col-span-5 flex",
      id: "performance-metrics",
    },
    {
      component: QuickStatsWidget,
      className:
        "2xl:col-span-4 xl:col-span-8 row-span-1 flex lg:col-span-3 md:col-span-3 sm:col-span-5",
      id: "quick-stats-widget",
    },
  ] as const;

  return (
    <PageContainer>
      <SiteHeader
        pageTitle={t("title")}
        pageDescription={t("description")}
        className="border-b border-b-white/10 pb-2"
      >
        <AdminNotificationsPopover />
      </SiteHeader>
      <Flex direction="column" gap={6} className="mt-6">
        <Grid
          cols={9}
          gap={4}
          className="w-full 2xl:grid-cols-9 xl:grid-cols-8 lg:grid-cols-7 md:grid-cols-6 sm:grid-cols-5 grid-cols-1"
        >
          {widgets.map(({ component: Component, className, id }, index) => (
            <AnimatedContainer
              key={id}
              initial={variants.initial}
              animate={variants.animate}
              exit={variants.exit}
              transition={{
                ...variants.transition,
                delay: index * 0.06,
                type: "spring" as const,
              }}
              className={className}
            >
              <Component />
            </AnimatedContainer>
          ))}
        </Grid>
      </Flex>
    </PageContainer>
  );
};

export default Home;
