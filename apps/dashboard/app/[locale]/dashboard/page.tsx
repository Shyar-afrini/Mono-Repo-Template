"use client";
import FavoritePages from "@/components/home/favorite-pages";
import RecentActivity from "@/components/home/recent-activity";
import PageContainer from "@/components/page-container";
import SiteHeader from "@/components/site-header";
import { AnimatedContainer, Flex, Grid } from "@mono-repo-template/ui";
import { localeBasedDirection } from "@mono-repo-template/utils";
import { useLocale, useTranslations } from "next-intl";

export default function Main() {
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
  const allWidgets = [
    {
      component: RecentActivity,
      className:
        "2xl:col-span-2 row-span-1 xl:col-span-2 lg:col-span-3 md:col-span-3 sm:col-span-2 w-full flex",
      id: "recent-activity",
      requiredPermissions: undefined as string[] | undefined,
    },
    {
      component: FavoritePages,
      className:
        "2xl:col-span-2 row-span-1 xl:col-span-3 lg:col-span-3 md:col-span-3 sm:col-span-2 flex",
      id: "favorite-pages",
      requiredPermissions: undefined as string[] | undefined,
    },
  ];

  // Filter widgets based on permissions
  const widgets = allWidgets.filter((widget) => {
    if (!widget.requiredPermissions) return true;
    return true;
  });

  return (
    <PageContainer>
      <SiteHeader
        pageTitle={t("title")}
        pageDescription={t("description")}
        className="border-b border-b-white/10 pb-2"
      >
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
}
