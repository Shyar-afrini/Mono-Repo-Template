"use client";

import Pusher from "pusher-js";

/**
 * Pusher Configuration
 * Client-side Pusher configuration with environment variable validation
 */

// Validate required environment variables
const getPusherConfig = () => {
  const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER;
  const forceTLS = process.env.NEXT_PUBLIC_PUSHER_FORCE_TLS !== "false"; // Default to true

  if (!appKey) {
    return null;
  }

  if (!cluster) {
    return null;
  }

  return {
    key: appKey,
    cluster,
    forceTLS,
    disableStats: true,
  };
};

/**
 * Creates a new Pusher instance
 * Returns null if configuration is invalid
 */
export const createPusherInstance = (): Pusher | null => {
  const config = getPusherConfig();

  if (!config) {
    return null;
  }

  try {
    return new Pusher(config.key, {
      cluster: config.cluster,
      forceTLS: config.forceTLS,
      disableStats: config.disableStats,
      // Authentication endpoint for private channels
      authEndpoint: "/api/pusher/auth",
      auth: {
        headers: {
          "Content-Type": "application/json",
        },
      },
    });
  } catch (error) {
    return null;
  }
};

/**
 * Get Pusher configuration (for debugging/logging purposes)
 */
export const getPusherConfigInfo = () => {
  const config = getPusherConfig();
  if (!config) {
    return null;
  }

  return {
    key: config.key.substring(0, 8) + "...",
    cluster: config.cluster,
    forceTLS: config.forceTLS,
  };
};
