"use client";

import { Flex, LocalizedText } from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";

import RolesGrid from "./roles-grid";

const RolesPage = () => {
  const t = useTranslations("roles.list");

  return (
    <Flex direction="column" gap={3} className="mt-4">
      <Flex direction="row" justify="between" align="center">
        <LocalizedText text={t("title")} />
      </Flex>
      <RolesGrid />
    </Flex>
  );
};

export default RolesPage;
