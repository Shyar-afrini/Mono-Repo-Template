"use client";

import { addToHistory } from "@/utils/navigation-history";
import { getPageMetadata, normalizePath } from "@/utils/navigation-metadata";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { createAuthClient } from "@mono-repo-template/auth";

/**
 * Hook to automatically track page visits in navigation history
 * Updates localStorage on route changes
 */
export const useNavigationHistory = () => {
  const pathname = usePathname();
  const locale = useLocale();
  const tSidebar = useTranslations("sidebar");
  const authClient = createAuthClient();
  const { data: currentUser } = authClient.getCurrentUser();

  useEffect(() => {
    // Skip if pathname is not available or is just the locale
    if (!pathname || pathname === `/${locale}` || pathname === `/${locale}/`) {
      return;
    }

    // Skip if user is not loaded yet
    if (!currentUser?.id) {
      return;
    }

    // Normalize pathname (remove locale prefix) before getting metadata
    const normalizedPath = normalizePath(pathname);

    // Get page metadata from navigation config using normalized path
    const metadata = getPageMetadata(normalizedPath, tSidebar);

    // If we have metadata, add to history
    if (metadata) {
      // Use a small delay to ensure the page has fully loaded
      const timeoutId = setTimeout(() => {
        // addToHistory will normalize the path again, but that's fine for consistency
        addToHistory(normalizedPath, metadata.title, undefined, currentUser.id);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [pathname, locale, tSidebar, currentUser?.id]);
}
