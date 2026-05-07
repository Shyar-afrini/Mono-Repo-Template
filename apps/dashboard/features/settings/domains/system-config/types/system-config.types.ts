/**
 * System Configuration Types
 * Types for managing system-wide configuration values
 */

/**
 * App Configuration Item
 * Represents a single system configuration setting
 */
export interface AppConfig {
  /**
   * Unique identifier for the configuration
   */
  id: string;

  /**
   * Configuration title (used as translation key)
   * Examples: "primary-service-operational", "fastpay-enabled", "fastpay-store-id"
   */
  title: string;

  /**
   * Configuration value
   * For boolean configs: "true" or "false"
   * For text configs: actual string value
   */
  value: string;

  /**
   * Description of the configuration (from API, can be overridden by translations)
   */
  description: string;

  /**
   * Roles that can view this configuration
   */
  visibleTo: string[];

  /**
   * Creation timestamp
   */
  createdAt: string;

  /**
   * Last update timestamp
   */
  updatedAt: string;
}

/**
 * Response type for GET /app-configs
 */
export type AppConfigsResponse = AppConfig[];

/**
 * Payload for updating a configuration
 */
export interface UpdateAppConfigPayload {
  /**
   * New value for the configuration
   * For boolean configs: "true" or "false"
   * For text configs: actual string value
   */
  value: string;
}

/**
 * Known configuration titles
 * Used for type safety and translation key generation
 */
export type ConfigTitle =
  | "primary-service-operational"
  | "mobile-service-operational"
  | "penalty-applied"
  | "fastpay-enabled"
  | "fastpay-store-id"
  | "fastpay-store-password";

/**
 * Check if a configuration is a boolean type
 * @param title - Configuration title
 * @returns true if the config is boolean type
 */
export function isBooleanConfig(title: string): boolean {
  const booleanConfigs: ConfigTitle[] = [
    "primary-service-operational",
    "mobile-service-operational",
    "penalty-applied",
    "fastpay-enabled",
  ];
  return booleanConfigs.includes(title as ConfigTitle);
}

/**
 * Check if a configuration is part of the FastPay group
 * @param title - Configuration title
 * @returns true if the config is part of FastPay group
 */
export function isFastPayConfig(title: string): boolean {
  return (
    title === "fastpay-enabled" ||
    title === "fastpay-store-id" ||
    title === "fastpay-store-password"
  );
}

/**
 * Local state for tracking configuration changes
 */
export interface ConfigChange {
  id: string;
  value: string;
}
