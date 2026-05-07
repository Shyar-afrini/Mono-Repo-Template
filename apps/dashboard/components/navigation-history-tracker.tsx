"use client";

import { useNavigationHistory } from "@/hooks/use-navigation-history";

/**
 * Component to automatically track navigation history
 * Should be placed in the root layout or providers
 */
export const NavigationHistoryTracker = () => {
  useNavigationHistory();
  return null;
};

