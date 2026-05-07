import { api, setApiBaseURL } from "@mono-repo-template/axios-client";
import { API_PATHS, API_CONFIG } from "@mono-repo-template/common";
import type { Role } from "@mono-repo-template/types";

type CreateRoleInput = {
  name: string;
  permissions?: string[];
};

type UpdateRoleInput = {
  name: string;
};

export interface RolesWithPermissions extends Role {
  permissions: string[];
  meta: {
    referencedAdmins: number;
    referencedPermissions: number;
    totalPermissions: number;
  };
}
class RolesApi {
  constructor(baseUrl: string) {
    setApiBaseURL(baseUrl);
  }

  async getRoles() {
    try {
      const response = await api.get(API_PATHS.PERMISSION_ROLES);
      return response.data.data as RolesWithPermissions[];
    } catch (error) {
      console.error("Error fetching roles");
      throw error;
    }
  }

  async createRole(payload: CreateRoleInput) {
    try {
      const response = await api.post(API_PATHS.PERMISSION_ROLES, payload);
      return response.data.data as Role;
    } catch (error) {
      console.error("Error creating role");
      throw error;
    }
  }

  async updateRole(id: string, payload: UpdateRoleInput) {
    try {
      const response = await api.put(
        `${API_PATHS.PERMISSION_ROLES}/${id}`,
        payload
      );
      return response.data.data as Role;
    } catch (error) {
      console.error("Error updating role");
      throw error;
    }
  }

  async deleteRole(id: string) {
    try {
      const response = await api.delete(`${API_PATHS.PERMISSION_ROLES}/${id}`);
      return response.data.data as Role;
    } catch (error) {
      console.error("Error deleting role");
      throw error;
    }
  }

  async getPermissions() {
    try {
      const response = await api.get(API_PATHS.PERMISSIONS);
      return response.data.data as string[];
    } catch (error) {
      console.error("Error fetching permissions");
      throw error;
    }
  }

  async updateRolePermissions(id: string, payload: { permissions: string[] }) {
    try {
      const response = await api.put(
        `${API_PATHS.PERMISSION_ROLES}/${id}`,
        payload
      );
      return response.data.data as RolesWithPermissions;
    } catch (error) {
      console.error("Error updating role permissions");
      throw error;
    }
  }
}

const createRolesApi = (baseUrl: string = API_CONFIG.BASE_URL) =>
  new RolesApi(baseUrl);

export default createRolesApi;
