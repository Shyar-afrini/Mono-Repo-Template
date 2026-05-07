/**
 * Navigation History Utilities
 * Manages page visit history in localStorage (user-specific)
 */

import { normalizePath } from "./navigation-metadata";

export interface NavigationHistoryItem {
  path: string;
  title: string; // Stored for fallback, but current language title is preferred
  icon?: string;
  timestamp: number;
}

const STORAGE_KEY_PREFIX = "dashboard_navigation_history";
const MAX_HISTORY_SIZE = 20; // Limit to prevent localStorage overflow

/**
 * Get storage key for a specific user
 */
const getStorageKey = (userId?: string | null): string => {
  if (!userId) {
    // Fallback to global key if no user ID (for backward compatibility)
    return STORAGE_KEY_PREFIX;
  }
  return `${STORAGE_KEY_PREFIX}_${userId}`;
};

/**
 * Get all navigation history from localStorage
 * Automatically migrates old history entries with locale prefixes to normalized paths
 */
export const getNavigationHistory = (userId?: string | null): NavigationHistoryItem[] => {
  if (typeof globalThis.window === "undefined") return [];

  try {
    const storageKey = getStorageKey(userId);
    const stored = globalThis.window.localStorage.getItem(storageKey);
    if (!stored) return [];

    const history = JSON.parse(stored) as NavigationHistoryItem[];
    if (!Array.isArray(history)) return [];

    // Migrate: normalize paths of existing history entries
    let needsMigration = false;
    const migratedHistory = history.map((item) => {
      const normalizedPath = normalizePath(item.path);
      if (item.path !== normalizedPath) {
        needsMigration = true;
        return { ...item, path: normalizedPath };
      }
      return item;
    });

    // Save migrated history if any changes were made
    if (needsMigration) {
      globalThis.window.localStorage.setItem(
        storageKey,
        JSON.stringify(migratedHistory)
      );
    }

    return migratedHistory;
  } catch (error) {
    console.error("Error reading navigation history:", error);
    return [];
  }
};

/**
 * Add a page to navigation history
 */
export const addToHistory = (
  path: string,
  title: string,
  icon?: string,
  userId?: string | null
): void => {
  if (globalThis.window === undefined) return;

  try {
    const history = getNavigationHistory(userId);
    const storageKey = getStorageKey(userId);

    // Normalize path (remove locale prefix) before storing
    const normalizedPath = normalizePath(path);

    // Remove existing entry with same normalized path (avoid duplicates)
    const filteredHistory = history.filter(
      (item) => normalizePath(item.path) !== normalizedPath
    );

    // Add new entry at the beginning with normalized path
    // Note: title is stored but will be overridden by current language when displaying
    const newEntry: NavigationHistoryItem = {
      path: normalizedPath,
      title,
      icon,
      timestamp: Date.now(),
    };

    const updatedHistory = [newEntry, ...filteredHistory];

    // Limit history size
    const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_SIZE);

    globalThis.window.localStorage.setItem(
      storageKey,
      JSON.stringify(limitedHistory)
    );

    // Dispatch custom event for history change
    globalThis.window.dispatchEvent(new CustomEvent("history-changed"));
  } catch (error) {
    console.error("Error adding to navigation history:", error);
  }
};

/**
 * Get recent navigation history (last N items)
 */
export const getRecentHistory = (
  limit: number = 5,
  userId?: string | null
): NavigationHistoryItem[] => {
  const history = getNavigationHistory(userId);
  return history.slice(0, limit);
};

/**
 * Clear all navigation history for a specific user (or all if no userId provided)
 */
export const clearHistory = (userId?: string | null): void => {
  if (globalThis.window === undefined) return;

  try {
    if (userId) {
      // Clear specific user's history
      const storageKey = getStorageKey(userId);
      globalThis.window.localStorage.removeItem(storageKey);
    } else {
      // Clear all user histories (for migration/logout cleanup)
      const keys = Object.keys(globalThis.window.localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          globalThis.window.localStorage.removeItem(key);
        }
      });
    }
    // Dispatch custom event for history change
    globalThis.window.dispatchEvent(new CustomEvent("history-changed"));
  } catch (error) {
    console.error("Error clearing navigation history:", error);
  }
};

/**
 * Remove a specific path from history
 */
export const removeFromHistory = (path: string, userId?: string | null): void => {
  if (globalThis.window === undefined) return;

  try {
    const history = getNavigationHistory(userId);
    const storageKey = getStorageKey(userId);
    const normalizedPath = normalizePath(path);
    const filteredHistory = history.filter(
      (item) => normalizePath(item.path) !== normalizedPath
    );
    globalThis.window.localStorage.setItem(
      storageKey,
      JSON.stringify(filteredHistory)
    );
  } catch (error) {
    console.error("Error removing from navigation history:", error);
  }
};
