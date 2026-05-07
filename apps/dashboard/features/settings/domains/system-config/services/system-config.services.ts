import { api } from "@mono-repo-template/axios-client";
import { API_PATHS } from "@mono-repo-template/common";
import type {
  AppConfig,
  AppConfigsResponse,
  UpdateAppConfigPayload,
} from "../types/system-config.types";

/**
 * System Configuration API Service
 * Handles all API calls related to system configurations including fetching and updating.
 * Includes comprehensive error handling with user-friendly error messages.
 */
class SystemConfigAPI {
  /**
   * Get all system configurations
   * @returns Promise resolving to array of configuration items
   * @throws Error with user-friendly message if API call fails
   */
  async getAppConfigs(): Promise<AppConfigsResponse> {
    try {
      const response = await api.get(API_PATHS.APP_CONFIGS);
      // API returns: { success, statusCode, data: [] }
      return response.data?.data ?? [];
    } catch (error: any) {
      console.error("Error fetching app configs:", error);
      // Extract error message from API response if available
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch configurations. Please try again.";
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).status = error?.response?.status;
      throw enhancedError;
    }
  }

  /**
   * Get a single config by title
   * Backend supports: GET /app-configs/title/:title (e.g. /app-configs/title/default-currency)
   */
  async getAppConfigByTitle(title: string): Promise<AppConfig> {
    try {
      const response = await api.get(`${API_PATHS.APP_CONFIGS}/title/${title}`);
      return response.data?.data as AppConfig;
    } catch (error: any) {
      console.error("Error fetching app config:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch configuration. Please try again.";
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).status = error?.response?.status;
      throw enhancedError;
    }
  }

  /**
   * Update a system configuration
   * @param id - Configuration ID
   * @param payload - Update payload with new value
   * @returns Promise resolving to updated configuration
   * @throws Error with user-friendly message if API call fails
   */
  async updateAppConfig(
    id: string,
    payload: UpdateAppConfigPayload
  ): Promise<AppConfig> {
    try {
      const response = await api.patch(
        `${API_PATHS.APP_CONFIGS}/${id}`,
        payload
      );
      // API returns: { success, statusCode, data: {} }
      return response.data?.data ?? response.data;
    } catch (error: any) {
      console.error("Error updating app config:", error);
      // Extract error message from API response if available
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update configuration. Please try again.";
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).status = error?.response?.status;
      throw enhancedError;
    }
  }
}

/**
 * Create and return a new instance of SystemConfigAPI
 */
export default function createSystemConfigAPI() {
  return new SystemConfigAPI();
}
