import type { Wallet } from "@mono-repo-template/types";
import { create } from "zustand";

/** Used until remote default-currency is loaded or if the request fails. */
export const DEFAULT_SYSTEM_CURRENCY: Wallet["currency"] = "IQD";

function normalizeSystemCurrency(value: unknown): Wallet["currency"] {
  if (typeof value !== "string" || value.trim().length === 0) {
    return DEFAULT_SYSTEM_CURRENCY;
  }
  const upper = value.trim().toUpperCase();
  if (upper === "IQD" || upper === "USD") {
    return upper as Wallet["currency"];
  }
  return DEFAULT_SYSTEM_CURRENCY;
}

interface SystemCurrencyStore {
  /** Resolved default accounting / display currency for the tenant. */
  systemCurrency: Wallet["currency"];
  /** True after the bootstrap query has settled (success or error). */
  isReady: boolean;
  /** Apply value from GET /app-configs/title/default-currency (or null on failure). */
  hydrateFromRemote: (value: unknown) => void;
}

export const useSystemCurrencyStore = create<SystemCurrencyStore>((set) => ({
  systemCurrency: DEFAULT_SYSTEM_CURRENCY,
  isReady: false,
  hydrateFromRemote: (value) =>
    set({
      systemCurrency: normalizeSystemCurrency(value),
      isReady: true,
    }),
}));
