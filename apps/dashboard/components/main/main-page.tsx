import { Link } from "@/i18n/navigation";
import useUser from "@/store/user.store";
import {
  AnimatedButton,
  Container,
  Flex,
  LocalizedText,
  ShinyText,
  Text,
} from "@mono-repo-template/ui";
import { getDayTimeStatus } from "@mono-repo-template/utils";
import { useTranslations } from "next-intl";
import { createUploadClient } from "@mono-repo-template/upload";
import Image from "next/image";
import { useMemo } from "react";
import Support from "./support";

const MainPage = () => {
  const t = useTranslations();
  const dayTimeStatus = getDayTimeStatus();
  const dayTimeKey = `mainPage.${dayTimeStatus.code}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dayTime = t(dayTimeKey as any);

  const userInfo = useUser((state) => state.userInfo);

  return (
    <Flex direction="row" gap={4} align="center" justify="between" className="w-full h-svh">
      <Flex direction="col" gap={1} align="center" justify="center" className="z-10 w-full">
        <Support />
        <ShinyText
          className="text-4xl rtl:font-cairo ltr:font-calSans rtl:font-bold dark:text-zinc-200 text-zinc-800"
          text={
            <LocalizedText
              text={
                userInfo
                  ? t("mainPage.welcomeMessageWithName", {
                    dayTime,
                    fullname: userInfo.fullname?.split(" ")[0] ?? "",
                  })
                  : t("mainPage.welcomeMessage", {
                    dayTime,
                  })
              }
            />
          }
        ></ShinyText>
        <Text className="dark:text-zinc-300 text-zinc-600 text-base mt-2">
          <LocalizedText text={t("mainPage.greeting")} />
        </Text>
        <Link href={"/auth/login"}>
          <AnimatedButton
            variant="default"
            size={"lg"}
            className="cursor-pointer mt-4"
          >
            <LocalizedText text={t("mainPage.button")} />
          </AnimatedButton>
        </Link>

      </Flex>
    </Flex>
  );
};

export default MainPage;
