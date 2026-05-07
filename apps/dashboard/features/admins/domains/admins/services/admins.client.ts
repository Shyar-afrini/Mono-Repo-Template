/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQuery } from "@tanstack/react-query";
import createAdminsApi from "./admins.api";
import type {
  CreateAdminInput,
  UpdateAdminInput,
  AdminWithRole,
} from "../types";

const adminQueryKeys = {
  getAdmins: () => ["admins"],
  getAdminById: (id: string) => ["admins", id],
  deleteAdmin: () => ["admins", "delete"],
  toggleStatus: () => ["admins", "status"],
  createAdmin: () => ["admins", "create"],
  changePassword: () => ["admins", "password"],
  getRoles: () => ["admins", "roles"],
};

class AdminsClient {
  private readonly adminsAPI = createAdminsApi();

  getQueryKeys() {
    return adminQueryKeys;
  }

  useGetAdmins(params?: {
    order?: "asc" | "desc";
    sortBy?: string;
    filter?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    return useQuery<{
      data: AdminWithRole[];
      meta: {
        totalCount: number;
        hasMorePages: boolean;
        totalPages: number;
        currentPage: number;
      };
    }>({
      queryKey: [...adminQueryKeys.getAdmins(), params],
      queryFn: async () => await this.adminsAPI.getAdmins(params),
    });
  }

  useGetAdminById(id: string, enabled: boolean = true) {
    return useQuery({
      queryKey: adminQueryKeys.getAdminById(id),
      queryFn: async () => await this.adminsAPI.getAdminById(id),
      enabled: enabled && !!id,
    });
  }

  useCreateAdmin() {
    return useMutation({
      mutationKey: adminQueryKeys.createAdmin(),
      mutationFn: async (payload: CreateAdminInput) =>
        this.adminsAPI.createAdmin(payload),
    });
  }

  useGetRoles() {
    return useQuery({
      queryKey: adminQueryKeys.getRoles(),
      queryFn: async () => await this.adminsAPI.getRoles(),
      staleTime: 5 * 60 * 1000,
    });
  }

  useUpdateAdmin() {
    return useMutation({
      mutationFn: async ({
        id,
        admin,
      }: {
        id: string;
        admin: UpdateAdminInput;
      }) => this.adminsAPI.updateAdmin(id, admin),
    });
  }

  useDeleteAdmin() {
    return useMutation({
      mutationKey: adminQueryKeys.deleteAdmin(),
      mutationFn: async (id: string) => this.adminsAPI.deleteAdmin(id),
    });
  }

  useToggleAdminStatus() {
    return useMutation({
      mutationKey: adminQueryKeys.toggleStatus(),
      mutationFn: async ({
        id,
        isActive,
      }: {
        id: string;
        isActive: boolean;
      }) =>
        isActive
          ? this.adminsAPI.deactivateAdmin(id)
          : this.adminsAPI.activateAdmin(id),
    });
  }

  useChangeAdminPassword() {
    return useMutation({
      mutationKey: adminQueryKeys.changePassword(),
      mutationFn: async ({ id, password }: { id: string; password: string }) =>
        this.adminsAPI.updateAdminPassword(id, { password }),
    });
  }
}

export function createAdminsClient() {
  return new AdminsClient();
}
