/**
 * Bookmarks Utilities
 * Manages bookmarked/favorite pages in localStorage (user-specific)
 */

export interface Bookmark {
  path: string;
  title: string;
  icon?: string;
  addedAt: number;
}

const STORAGE_KEY_PREFIX = "dashboard_bookmarks";
const MAX_BOOKMARKS_SIZE = 50; // Limit to prevent localStorage overflow

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
 * Get all bookmarks from localStorage
 * Automatically migrates old bookmarks with locale prefixes to normalized paths
 */
export const getBookmarks = (userId?: string | null): Bookmark[] => {
  if (globalThis.window === undefined) return [];

  try {
    const storageKey = getStorageKey(userId);
    const stored = globalThis.window.localStorage.getItem(storageKey);
    if (!stored) return [];

    const bookmarks = JSON.parse(stored) as Bookmark[];
    if (!Array.isArray(bookmarks)) return [];

    // Migrate: normalize paths of existing bookmarks
    let needsMigration = false;
    const migratedBookmarks = bookmarks.map((bookmark) => {
      const normalizedPath = normalizePath(bookmark.path);
      if (bookmark.path !== normalizedPath) {
        needsMigration = true;
        return { ...bookmark, path: normalizedPath };
      }
      return bookmark;
    });

    // Save migrated bookmarks if any changes were made
    if (needsMigration) {
      globalThis.window.localStorage.setItem(
        storageKey,
        JSON.stringify(migratedBookmarks)
      );
    }

    return migratedBookmarks;
  } catch (error) {
    console.error("Error reading bookmarks:", error);
    return [];
  }
};

/**
 * Normalize path by removing locale prefix
 */
const normalizePath = (path: string): string => {
  // Remove locale prefix if present (e.g., /ar/dashboard/users -> /dashboard/users)
  // Also handle paths that start with /dashboard directly
  const normalized = path.replace(/^\/(ar|en|ku)\//, "/").replace(/^\/(ar|en|ku)$/, "/");
  return normalized || "/";
};

/**
 * Add a page to bookmarks
 */
export const addBookmark = (
  path: string,
  title: string,
  icon?: string,
  userId?: string | null
): void => {
  if (globalThis.window === undefined) return;

  try {
    const bookmarks = getBookmarks(userId);
    const storageKey = getStorageKey(userId);

    // Normalize path (remove locale prefix) before storing
    const normalizedPath = normalizePath(path);

    // Check if already bookmarked (compare normalized paths)
    if (bookmarks.some((bookmark) => normalizePath(bookmark.path) === normalizedPath)) {
      return; // Already bookmarked
    }

    // Add new bookmark with normalized path
    // Note: title is stored but will be overridden by current language when displaying
    const newBookmark: Bookmark = {
      path: normalizedPath,
      title,
      icon,
      addedAt: Date.now(),
    };

    const updatedBookmarks = [...bookmarks, newBookmark];

    // Limit bookmarks size
    const limitedBookmarks = updatedBookmarks.slice(0, MAX_BOOKMARKS_SIZE);

    globalThis.window.localStorage.setItem(
      storageKey,
      JSON.stringify(limitedBookmarks)
    );

    // Dispatch custom event for bookmark change
    globalThis.window.dispatchEvent(new CustomEvent("bookmarks-changed"));
  } catch (error) {
    console.error("Error adding bookmark:", error);
  }
};

/**
 * Remove a page from bookmarks
 */
export const removeBookmark = (path: string, userId?: string | null): void => {
  if (globalThis.window === undefined) return;

  try {
    const bookmarks = getBookmarks(userId);
    const storageKey = getStorageKey(userId);
    const normalizedPath = normalizePath(path);
    const filteredBookmarks = bookmarks.filter(
      (bookmark) => normalizePath(bookmark.path) !== normalizedPath
    );

    globalThis.window.localStorage.setItem(
      storageKey,
      JSON.stringify(filteredBookmarks)
    );

    // Dispatch custom event for bookmark change
    globalThis.window.dispatchEvent(new CustomEvent("bookmarks-changed"));
  } catch (error) {
    console.error("Error removing bookmark:", error);
  }
};

/**
 * Check if a path is bookmarked
 */
export const isBookmarked = (path: string, userId?: string | null): boolean => {
  if (globalThis.window === undefined) return false;

  try {
    const bookmarks = getBookmarks(userId);
    const normalizedPath = normalizePath(path);
    return bookmarks.some((bookmark) => normalizePath(bookmark.path) === normalizedPath);
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
};

/**
 * Toggle bookmark state for a path
 */
export const toggleBookmark = (
  path: string,
  title: string,
  icon?: string,
  userId?: string | null
): boolean => {
  if (globalThis.window === undefined) return false;

  const currentlyBookmarked = isBookmarked(path, userId);

  if (currentlyBookmarked) {
    removeBookmark(path, userId);
    return false;
  } else {
    // Normalize path before adding
    const normalizedPath = normalizePath(path);
    addBookmark(normalizedPath, title, icon, userId);
    return true;
  }
};

/**
 * Clear all bookmarks for a specific user (or all if no userId provided)
 */
export const clearBookmarks = (userId?: string | null): void => {
  if (globalThis.window === undefined) return;

  try {
    if (userId) {
      // Clear specific user's bookmarks
      const storageKey = getStorageKey(userId);
      globalThis.window.localStorage.removeItem(storageKey);
    } else {
      // Clear all user bookmarks (for migration/logout cleanup)
      const keys = Object.keys(globalThis.window.localStorage);
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          globalThis.window.localStorage.removeItem(key);
        }
      });
    }
    // Dispatch custom event for bookmark change
    globalThis.window.dispatchEvent(new CustomEvent("bookmarks-changed"));
  } catch (error) {
    console.error("Error clearing bookmarks:", error);
  }
};
