"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type SidebarVariant = "sidebar" | "floating" | "inset";

const SIDEBAR_VARIANT_STORAGE_KEY = "sidebar-variant";
const DEFAULT_VARIANT: SidebarVariant = "floating";

interface SidebarVariantContextType {
  variant: SidebarVariant;
  setVariant: (variant: SidebarVariant) => void;
  mounted: boolean;
}

const SidebarVariantContext = createContext<SidebarVariantContextType | null>(
  null
);

export function SidebarVariantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [variant, setVariantState] = useState<SidebarVariant>(DEFAULT_VARIANT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get variant from localStorage
    const stored = localStorage.getItem(SIDEBAR_VARIANT_STORAGE_KEY);
    if (
      stored &&
      (stored === "sidebar" || stored === "floating" || stored === "inset")
    ) {
      setVariantState(stored as SidebarVariant);
    }
  }, []);

  const setVariant = (newVariant: SidebarVariant) => {
    setVariantState(newVariant);
    localStorage.setItem(SIDEBAR_VARIANT_STORAGE_KEY, newVariant);
  };

  return (
    <SidebarVariantContext.Provider
      value={{
        variant: mounted ? variant : DEFAULT_VARIANT,
        setVariant,
        mounted,
      }}
    >
      {children}
    </SidebarVariantContext.Provider>
  );
}

export function useSidebarVariant() {
  const context = useContext(SidebarVariantContext);
  if (!context) {
    throw new Error(
      "useSidebarVariant must be used within SidebarVariantProvider"
    );
  }
  return context;
}
