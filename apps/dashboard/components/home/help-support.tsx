"use client";

import {
  Container,
  Flex,
  LocalizedText,
  Text,
  AnimatedButton,
  Grid,
} from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  MessageCircle,
  HelpCircle,
  Video,
  ExternalLink,
} from "lucide-react";

const HelpSupport = () => {
  const t = useTranslations("home.helpSupport");

  const helpItems = [
    {
      id: "documentation",
      label: t("documentation"),
      icon: BookOpen,
      href: "#", // Replace with actual documentation URL
      external: true,
    },
    {
      id: "contactSupport",
      label: t("contactSupport"),
      icon: MessageCircle,
      href: "#", // Replace with actual support contact URL or email
      external: false,
    },
    {
      id: "faq",
      label: t("faq"),
      icon: HelpCircle,
      href: "#", // Replace with actual FAQ URL
      external: true,
    },
    {
      id: "tutorials",
      label: t("tutorials"),
      icon: Video,
      href: "#", // Replace with actual tutorials URL
      external: true,
    },
  ];

  const handleClick = (item: typeof helpItems[0]) => {
    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else {
      // For contact support, could open a modal or navigate to a contact page
      window.location.href = item.href;
    }
  };

  return (
    <Container className="w-full bg-zinc-900 rounded-xl p-6">
      <Flex direction="column" gap={4}>
        <Text className="text-base font-semibold text-foreground">
          <LocalizedText text={t("title")} />
        </Text>
        <Grid
          cols={4}
          gap={3}
          className="w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
        >
          {helpItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <AnimatedButton
                key={item.id}
                variant="ghost"
                className="p-4 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors h-auto flex-col gap-3"
                onClick={() => handleClick(item)}
              >
                <Flex
                  direction="row"
                  align="center"
                  justify="center"
                  className="p-3 bg-linear-to-tl from-zinc-700/60 to-zinc-800/60 rounded-xl w-fit"
                >
                  <IconComponent size={20} className="text-foreground" />
                </Flex>
                <Flex direction="row" align="center" gap={1}>
                  <Text className="text-sm font-medium text-foreground text-center">
                    {item.label}
                  </Text>
                  {item.external && (
                    <ExternalLink size={14} className="text-muted-foreground" />
                  )}
                </Flex>
              </AnimatedButton>
            );
          })}
        </Grid>
      </Flex>
    </Container>
  );
};

export default HelpSupport;

