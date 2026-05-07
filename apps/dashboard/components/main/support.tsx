"use client";
import InterlinkedLogo from "@/public/assets/icons/interlinked.png";
import {
  ANIMATION_CONSTANTS,
  SUPPORT_CONSTANTS,
} from "@mono-repo-template/common";
import {
  Container,
  Flex,
  LocalizedText,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@mono-repo-template/ui";
import { LucideProps } from "lucide-react";
import { DynamicIcon, dynamicIconImports } from "lucide-react/dynamic";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
const AnimatedContainer = motion(Container);
const AnimatedFlex = motion(Flex);

const Support = () => {
  const t = useTranslations("mainPage");
  return (
    <Container className="absolute rtl:right-4 ltr:left-4 top-4 z-10">
      <Popover>
        <PopoverTrigger className="">
          <AnimatedContainer
            whileTap={ANIMATION_CONSTANTS.clickable.cursor.whileTap}
            whileHover={ANIMATION_CONSTANTS.clickable.cursor.whileHover}
            transition={ANIMATION_CONSTANTS.clickable.spring}
            className="p-3 bg-popover border border-primary/5 rounded-lg cursor-pointer"
          >
            <Flex gap={2} align="center">
              <Image
                src={InterlinkedLogo}
                alt="Interlinked Logo"
                width={28}
                height={28}
                loading="eager"
              />
              <Text className="text-popover-foreground text-sm">
                <LocalizedText text={t("support")} />
              </Text>
            </Flex>
          </AnimatedContainer>
        </PopoverTrigger>
        <PopoverContent
          side="bottom"
          align="start"
          className="p-2 flex flex-col gap-1 border border-primary/5"
        >
          <SupportContactItem
            value={SUPPORT_CONSTANTS.phone}
            name="phone"
            href={`tel:${SUPPORT_CONSTANTS.phone}`}
          />
          <SupportContactItem
            value={SUPPORT_CONSTANTS.secondaryPhone}
            name="phone"
            href={`tel:${SUPPORT_CONSTANTS.secondaryPhone}`}
          />
          <SupportContactItem
            value={SUPPORT_CONSTANTS.email}
            name="mail"
            href={`mailto:${SUPPORT_CONSTANTS.email}`}
          />
          <SupportContactItem
            value={SUPPORT_CONSTANTS.website}
            name="globe"
            href={SUPPORT_CONSTANTS.website}
          />
        </PopoverContent>
      </Popover>
    </Container>
  );
};

interface IconProps extends Omit<LucideProps, "ref"> {
  value: string;
  name: keyof typeof dynamicIconImports;
  href: string;
}

const SupportContactItem = ({ value, href, ...props }: IconProps) => {
  return (
    <Link href={href}>
      <AnimatedFlex
        whileTap={ANIMATION_CONSTANTS.clickable.cursor.whileTap}
        whileHover={ANIMATION_CONSTANTS.clickable.cursor.whileHover}
        transition={ANIMATION_CONSTANTS.clickable.spring}
        gap={2}
        align="center"
        className="p-3  rounded-md cursor-pointer"
      >
        <DynamicIcon name={props.name} size={16} />
        <Text className="text-sm">{value}</Text>
      </AnimatedFlex>
    </Link>
  );
};

export default Support;
