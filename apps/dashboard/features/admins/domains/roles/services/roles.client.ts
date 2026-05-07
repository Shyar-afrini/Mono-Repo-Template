/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Role } from "@mono-repo-template/types";

import createRolesApi from "./roles.api";

const rolesQueryKeys = {
  all: () => ["roles"] as const,
  list: () => [...rolesQueryKeys.all(), "list"] as const,
  permissions: () => [...rolesQueryKeys.all(), "permissions"] as const,
};

class RolesClient {
  private readonly api = createRolesApi();

  getQueryKeys() {
    return rolesQueryKeys;
  }

  useGetRoles() {
    return useQuery({
      queryKey: rolesQueryKeys.list(),
      queryFn: async () => await this.api.getRoles(),
    });
  }

  useCreateRole() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (payload: { name: string; permissions?: string[] }) =>
        this.api.createRole(payload),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: rolesQueryKeys.list(),
        });
      },
    });
  }

  useUpdateRole() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({ id, name }: { id: string; name: string }) =>
        this.api.updateRole(id, { name }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: rolesQueryKeys.list(),
        });
      },
    });
  }

  useDeleteRole() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => this.api.deleteRole(id),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: rolesQueryKeys.list(),
        });
      },
    });
  }

  useGetPermissions() {
    return useQuery({
      queryKey: rolesQueryKeys.permissions(),
      queryFn: async () => await this.api.getPermissions(),
    });
  }

  useUpdateRolePermissions() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({
        id,
        permissions,
      }: {
        id: string;
        permissions: string[];
      }) => this.api.updateRolePermissions(id, { permissions }),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: rolesQueryKeys.list(),
        });
      },
    });
  }
}

export const createRolesClient = () => new RolesClient();

export type { Role };
