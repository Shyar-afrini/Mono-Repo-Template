/**
 * Pusher Types
 * Type definitions for Pusher channels, events, and connection states
 */

/**
 * Channel Names
 * Centralized channel naming constants
 */
export const PUSHER_CHANNELS = {
  /**
   * Notification Channels
   */
  NOTIFICATIONS: {
    /**
     * Private channel for user-specific notifications
     * Format: private-notifications-{userId}
     */
    PRIVATE: (userId: string) => `private-notifications-${userId}`,
  },
  /**
   * Ticket Channels
   */
  TICKETS: {
    /**
     * Private channel for user-specific tickets
     * Format: private-tickets-{userId}
     */
    PRIVATE: (userId: string) => `private-tickets-${userId}`,
  },
} as const;

/**
 * Event Names
 * Centralized event naming constants
 */
export const PUSHER_EVENTS = {
  /**
   * Notification Events
   */
  NOTIFICATION: {
    CREATED: "notification.created",
  },
} as const;

/**
 * Connection State
 * Possible Pusher connection states
 */
export type PusherConnectionState =
  | "initializing"
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "error";

/**
 * Base Event Payload
 * All Pusher events should extend this interface
 */
export interface BasePusherEvent {
  /**
   * Event timestamp (ISO string)
   */
  timestamp: string;
  /**
   * Event type identifier
   */
  eventType: string;
}
