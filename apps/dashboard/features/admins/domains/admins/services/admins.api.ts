import { api, setApiBaseURL } from "@mono-repo-template/axios-client";
import { API_PATHS, API_CONFIG } from "@mono-repo-template/common";
import type {
  CreateAdminInput,
  UpdateAdminInput,
  AdminWithRole,
} from "../types";

type RoleResponse = {
  id: string;
  name: string;
};

class AdminsApi {
  constructor(baseUrl: string) {
    setApiBaseURL(baseUrl);
  }

  async getAdmins(params?: {
    order?: "asc" | "desc";
    sortBy?: string;
    filter?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const queryParams = new URLSearchParams();

      if (params?.order) {
        queryParams.append("order", params.order);
      }

      if (params?.sortBy) {
        queryParams.append("sortBy", params.sortBy);
      }

      if (params?.filter) {
        queryParams.append("filter", params.filter);
      }

      if (params?.q) {
        queryParams.append("q", params.q);
      }

      if (typeof params?.page === "number") {
        queryParams.append("page", params.page.toString());
      }

      if (typeof params?.limit === "number") {
        queryParams.append("limit", params.limit.toString());
      }

      const url = queryParams.toString()
        ? `${API_PATHS.ADMINS}?${queryParams.toString()}`
        : API_PATHS.ADMINS;

      const response = await api.get(url);
      return response.data.data as {
        data: AdminWithRole[];
        meta: {
          totalCount: number;
          hasMorePages: boolean;
          totalPages: number;
          currentPage: number;
        };
      };
    } catch (error) {
      console.log("Error fetching admins");
      throw error;
    }
  }

  async getAdminById(id: string) {
    try {
      const response = await api.get(`${API_PATHS.ADMINS}/${id}`);
      return response.data.data as AdminWithRole;
    } catch (error) {
      console.log("Error fetching admin by id");
      throw error;
    }
  }

  async createAdmin(admin: CreateAdminInput) {
    try {
      const response = await api.post(API_PATHS.ADMINS, admin);
      return response.data.data as AdminWithRole;
    } catch (error) {
      console.log("Error creating admin");
      throw error;
    }
  }

  async updateAdmin(id: string, admin: UpdateAdminInput) {
    try {
      const response = await api.put(`${API_PATHS.ADMINS}/${id}`, admin);
      return response.data.data as AdminWithRole;
    } catch (error) {
      console.log("Error updating admin");
      throw error;
    }
  }

  async getRoles() {
    try {
      const response = await api.get(API_PATHS.PERMISSION_ROLES);
      return response.data.data as RoleResponse[];
    } catch (error) {
      console.log("Error fetching roles");
      throw error;
    }
  }

  async deleteAdmin(id: string) {
    try {
      const response = await api.delete(`${API_PATHS.ADMINS}/${id}`);
      return response.data.data as AdminWithRole;
    } catch (error) {
      console.log("Error deleting admin");
      throw error;
    }
  }

  async activateAdmin(id: string) {
    try {
      const response = await api.patch(`${API_PATHS.ADMINS}/${id}/activate`);
      return response.data.data as AdminWithRole;
    } catch (error) {
      console.log("Error activating admin");
      throw error;
    }
  }

  async deactivateAdmin(id: string) {
    try {
      const response = await api.patch(`${API_PATHS.ADMINS}/${id}/deactivate`);
      return response.data.data as AdminWithRole;
    } catch (error) {
      console.log("Error deactivating admin");
      throw error;
    }
  }

  async updateAdminPassword(id: string, payload: { password: string }) {
    try {
      const response = await api.patch(
        `${API_PATHS.ADMINS}/${id}/change-password`,
        payload
      );
      return response.data.data as AdminWithRole;
    } catch (error) {
      console.log("Error updating admin password");
      throw error;
    }
  }
}

export default function createAdminsApi(baseUrl: string = API_CONFIG.BASE_URL) {
  return new AdminsApi(baseUrl);
}
