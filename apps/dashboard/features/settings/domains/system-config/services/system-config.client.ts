/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import createSystemConfigAPI from "./system-config.services";
import type { UpdateAppConfigPayload } from "../types/system-config.types";

const systemConfigQueryKeys = {
  all: ["app-configs"] as const,
  lists: () => [...systemConfigQueryKeys.all, "list"] as const,
  list: () => [...systemConfigQueryKeys.lists()] as const,
  details: () => [...systemConfigQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...systemConfigQueryKeys.details(), id] as const,
  byTitle: (title: string) => [...systemConfigQueryKeys.details(), "title", title] as const,
};

class SystemConfigClient {
  private readonly systemConfigAPI = createSystemConfigAPI();

  getQueryKeys() {
    return systemConfigQueryKeys;
  }
  useGetAppConfigs() {
    return useQuery({
      queryKey: systemConfigQueryKeys.list(),
      queryFn: async () => await this.systemConfigAPI.getAppConfigs(),
    });
  }

  useGetAppConfigByTitle(title: string, options?: { enabled?: boolean }) {
    return useQuery({
      queryKey: systemConfigQueryKeys.byTitle(title),
      queryFn: async () => await this.systemConfigAPI.getAppConfigByTitle(title),
      enabled: options?.enabled ?? true,
    });
  }

  /**
   * Hook to update a system configuration
   */
  useUpdateAppConfig() {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async ({
        id,
        payload,
      }: {
        id: string;
        payload: UpdateAppConfigPayload;
      }) => this.systemConfigAPI.updateAppConfig(id, payload),
      onSuccess: () => {
        // Invalidate the list query to refetch updated data
        queryClient.invalidateQueries({
          queryKey: systemConfigQueryKeys.list(),
        });
      },
    });
  }
}

export function createSystemConfigClient() {
  return new SystemConfigClient();
}
