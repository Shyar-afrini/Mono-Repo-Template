import { NextRequest } from "next/server";
import type { CurrentUser } from "@mono-repo-template/types";
import { API_PATHS, API_CONFIG } from "@mono-repo-template/common";
import { api } from "@mono-repo-template/axios-client";

// Simple in-memory cache to prevent rate limiting
const userCache = new Map<
  string,
  { user: CurrentUser | null; timestamp: number }
>();
const CACHE_TTL = 5000; // 5 seconds cache

/**
 * Fetch current user with permissions from API
 * Used in middleware to check route permissions
 */
export async function getCurrentUserWithPermissions(
  request: NextRequest
): Promise<CurrentUser | null> {
  const sessionCookie = request.cookies.get("session_token")?.value;

  if (!sessionCookie) {
    return null;
  }

  // Check cache first
  const cached = userCache.get(sessionCookie);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.user;
  }

  try {
    const response = await api.get(
      `${API_CONFIG.BASE_URL}${API_PATHS.GET_CURRENT_USER}`,
      {
        headers: {
          Cookie: `session_token=${sessionCookie}`,
        },
      }
    );

    if (response.status !== 200) {
      userCache.set(sessionCookie, { user: null, timestamp: Date.now() });
      return null;
    }

    const data = await response.data;

    // Handle API response structure: { success: boolean, data: CurrentUser }
    if (data.success && data.data) {
      const user = data.data as CurrentUser;
      userCache.set(sessionCookie, { user, timestamp: Date.now() });
      return user;
    }

    userCache.set(sessionCookie, { user: null, timestamp: Date.now() });
    return null;
  } catch (error: any) {
    // Don't log 429 errors to reduce spam
    if (error?.response?.status !== 429) {
      console.error("Error fetching current user in middleware:", error);
    }
    // Cache null result to prevent hammering the API
    userCache.set(sessionCookie, { user: null, timestamp: Date.now() });
    return null;
  }
}

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of userCache.entries()) {
    if (now - value.timestamp > CACHE_TTL * 2) {
      userCache.delete(key);
    }
  }
}, CACHE_TTL * 2);
