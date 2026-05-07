"use client";

import ShieldCheck from "@/public/assets/icons/shield_check.svg";
import { Badge, Flex, Text, Title } from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { RolesWithPermissions } from "../services/roles.api";
import RoleOptionsPopover from "./popovers/role-options-popover";

const RoleCard = ({ role }: { role: RolesWithPermissions }) => {
  const t = useTranslations("roles");

  return (
    <Flex
      direction="column"
      gap={3}
      className="w-full h-full relative bg-card p-4 rounded-2xl transition-colors"
    >
      {/* Header with Unit Number and Options */}
      <Flex direction="row" align="center" justify="between">
        <Flex direction="row" align="center" gap={2}>
          <Flex
            direction="row"
            align="center"
            justify="center"
            className="p-4 bg-linear-to-tl dark:from-zinc-700/60 dark:to-zinc-800/60 from-zinc-300/60 to-zinc-400/60 rounded-lg"
          >
            <Image
              src={ShieldCheck}
              alt="Shield Check"
              width={24}
              height={24}
            />
          </Flex>
          <Flex direction="column" gap={1} align="start" justify="start">
            <Title className="dark:text-card-foreground text-zinc-900 text-base font-semibold">
              {role.name}
            </Title>
            <Badge
              variant="outline"
              className="py-1 px-2 w-auto dark:bg-blue-500/10 bg-blue-500/20 text-blue-500 dark:border-blue-500/40 border-blue-500/60"
            >
              <Text className="text-xs">
                {role.meta.referencedAdmins} {t("list.admins")}
              </Text>
            </Badge>
          </Flex>
        </Flex>
        <RoleOptionsPopover role={role} />
      </Flex>

      {/* Status Badge */}

      {/* Unit Details */}
    </Flex>
  );
};

export default RoleCard;
