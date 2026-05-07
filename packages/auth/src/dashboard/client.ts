import { useMutation, useQuery } from "@tanstack/react-query";
import createAuthApi from "./api";
const queryKeys = {
  signIn: () => ["sign-in"],
  validateSession: () => ["validate-session"],
  getCurrentUser: () => ["get-current-user"],
};
class AuthClient {
  private readonly apiClient = createAuthApi();

  signIn() {
    return useMutation({
      mutationFn: async (credentials: { email: string; password: string }) =>
        await this.apiClient.signIn(credentials.email, credentials.password),
    });
  }
  getCurrentUser() {
    return useQuery({
      queryKey: queryKeys.getCurrentUser(),
      queryFn: async () => await this.apiClient.getCurrentUser(),
    });
  }
  validateSession() {
    return useQuery({
      queryKey: queryKeys.validateSession(),
      queryFn: async () => await this.apiClient.validateSession(),
      retry: 2,
      retryDelay: 1000,
      staleTime: 0,
    });
  }
  signOut() {
    return useMutation({
      mutationFn: async () => await this.apiClient.signOut(),
      retry: 2,
    });
  }
}

export function createAuthClient() {
  return new AuthClient();
}
