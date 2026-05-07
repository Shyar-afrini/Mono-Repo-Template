import { api, setAuthBaseURL } from "@mono-repo-template/axios-client";
import { TResult } from "@mono-repo-template/backend/types";
import { API_CONFIG, API_PATHS } from "@mono-repo-template/common";
import { Admin, CurrentUser } from "@mono-repo-template/types";

// Type aliases - define once, use everywhere
type SignInResponse = TResult<
  Pick<Admin, "id" | "fullname" | "email" | "isActive" | "profilePhoto">
>;
type ValidateSessionResponse = TResult<{
  expiresAt: number;
  success: boolean;
  message: string;
}>;
class AuthApi {
  constructor(baseUrl: string) {
    setAuthBaseURL(baseUrl);
  }
  async signIn(email: string, password: string): Promise<SignInResponse> {
    try {
      const requestData = {
        email,
        password,
      };
      const response = await api.post(API_PATHS.SIGN_IN, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data as SignInResponse;
    } catch (error) {
      console.log("Error logging in", error);
      console.log("Error logging in");
      throw error;
    }
  }

  async validateSession(): Promise<ValidateSessionResponse> {
    try {
      const response = await api.get(API_PATHS.VALIDATE_SESSION);
      return response.data as ValidateSessionResponse;
    } catch (error) {
      console.log("Error validating session");
      throw error;
    }
  }
  async getCurrentUser(): Promise<CurrentUser> {
    try {
      const response = await api.get(API_PATHS.GET_CURRENT_USER);
      return response.data.data as CurrentUser;
    } catch (error) {
      console.log("Error getting current user");
      throw error;
    }
  }
  async signOut(): Promise<void> {
    try {
      const response = await api.post(API_PATHS.LOGOUT);
      return response.data;
    } catch (error) {
      console.log("Error logging out");
      throw error;
    }
  }
}

export default function createAuthApi(baseUrl: string = API_CONFIG.BASE_URL) {
  return new AuthApi(baseUrl);
}

//
// Server-side auth utilities for middleware
export async function validateSessionServer(): Promise<ValidateSessionResponse> {
  try {
    const response = await api.post(
      API_PATHS.VALIDATE_SESSION,
      {},
      {
        withCredentials: true,
        baseURL: API_CONFIG.BASE_URL,
      }
    );

    return response.data as ValidateSessionResponse;
  } catch (error) {
    console.log("Error validating session on server", error);
    return {
      success: false,
      statusCode: 500,
      error: {
        code: "500",
        message: "Internal server error",
        source: "internal",
        details: {
          error: error,
        },
      },
    };
  }
}
