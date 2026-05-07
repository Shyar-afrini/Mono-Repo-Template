"use client";

import {
  EmptyDataHandler,
  FetchErrorHandler,
  Grid,
  SkeletonLoadingHandler,
} from "@mono-repo-template/ui";

import { motion } from "motion/react";
import { createRolesClient } from "../services/roles.client";
import RoleCard from "./role-card";
import {
  RolesEmptyDataComponent,
  RolesErrorComponent,
  RolesLoadingSkeleton,
} from "./roles-placeholders";

const AnimatedRoleCard = motion.create(RoleCard);

const RolesGrid = () => {
  const rolesClient = createRolesClient();
  const { data: roles, isPending, isError } = rolesClient.useGetRoles();
  return (
    <FetchErrorHandler
      isError={isError}
      customErrorComponent={<RolesErrorComponent />}
    >
      <SkeletonLoadingHandler
        isLoading={isPending}
        customSkeleton={<RolesLoadingSkeleton />}
      >
        <EmptyDataHandler
          isEmpty={roles?.length === 0}
          customEmptyDataComponent={<RolesEmptyDataComponent />}
        >
          <Grid
            cols={4}
            gap={4}
            className="w-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {roles?.map((role, index) => (
              <AnimatedRoleCard
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 2.2,
                  duration: 0.3,
                  delay: index * 0.05,
                }}
                key={role.id}
                role={role}
              />
            ))}
          </Grid>
        </EmptyDataHandler>
      </SkeletonLoadingHandler>
    </FetchErrorHandler>
  );
};

export default RolesGrid;
