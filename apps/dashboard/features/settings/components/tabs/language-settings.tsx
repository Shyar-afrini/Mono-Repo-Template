"use client";

import {
  Container,
  Flex,
  Grid,
  LocalizedText,
  Text,
  Title,
} from "@mono-repo-template/ui";
import { useLocale, useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { cn } from "@mono-repo-template/utils";

const LanguageSettings = () => {
  const t = useTranslations("settings.tabs.language");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "ar", name: "Arabic", nativeName: "العربية" },
    { code: "ku", name: "Kurdish", nativeName: "کوردی" },
  ];

  const handleLanguageChange = (localeCode: string) => {
    router.push(pathname, { locale: localeCode as "en" | "ar" | "ku" });
  };

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

        <Flex direction="col" gap={4}>
          <Container className="rounded-lg border dark:border-border/40 border-zinc-200/40 dark:bg-card bg-white p-4 w-full">
            <Flex direction="col" gap={3}>
              <Text className="text-sm font-medium dark:text-foreground text-zinc-900">
                <LocalizedText text={t("preferredLanguage.label")} />
              </Text>
              <Text className="text-xs dark:text-muted-foreground text-zinc-600">
                <LocalizedText text={t("preferredLanguage.description")} />
              </Text>
              <Grid cols={3} gap={2} className="mt-2 w-full xl:grid-cols-3 lg:grid-cols-2 grid-cols-1">
                {languages.map((lang) => {
                  const isActive = locale === lang.code;
                  return (
                    <Container
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`rounded-lg border w-full dark:border-border/40 border-zinc-200/40 p-3 cursor-pointer dark:hover:border-border hover:border-zinc-300 transition-colors ${
                        isActive
                          ? "dark:bg-white bg-zinc-800 dark:text-zinc-900 text-white"
                          : "dark:bg-zinc-900/40 bg-zinc-50"
                      }`}
                    >
                      <Flex direction="row" align="center" gap={3}>
                        <Globe
                          size={20}
                          className={cn(
                            "dark:text-zinc-500 text-zinc-600",
                            isActive && "dark:text-zinc-900 text-white"
                          )}
                        />
                        <Flex direction="col" gap={0.5}>
                          <Text
                            className={`text-sm font-medium ${isActive ? "dark:text-zinc-900 text-white" : "dark:text-foreground text-zinc-900"}`}
                          >
                            {lang.name}
                          </Text>
                          <Text
                            className={`text-xs ${isActive ? "dark:text-zinc-700 text-white" : "dark:text-muted-foreground text-zinc-600"}`}
                          >
                            {lang.nativeName}
                          </Text>
                        </Flex>
                      </Flex>
                    </Container>
                  );
                })}
              </Grid>
            </Flex>
          </Container>
        </Flex>
      </Flex>
    </Container>
  );
};

export default LanguageSettings;
