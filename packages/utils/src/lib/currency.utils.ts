// ─── Shared types ────────────────────────────────────────────────────────────

export type NullableNumericValue = string | number | null | undefined;

// ─── Existing formatCurrency (kept unchanged for backward compatibility) ──────

/**
 * Format a numeric amount as a currency string using Intl.NumberFormat.
 * Used by contracts, housing, and reports. Do not modify the signature.
 */
export const formatCurrency = (
  locale: string,
  currency: string,
  amount?: NullableNumericValue
): string | null => {
  if (amount === null || amount === undefined) {
    return null;
  }
  const numericValue =
    typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(numericValue)) {
    return null;
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numericValue);
  } catch {
    return `${numericValue}`;
  }
};

// ─── Currency configuration ───────────────────────────────────────────────────

/**
 * Standard decimal places per ISO 4217 currency code.
 * IQD uses 0 decimals in practice (fils are not circulated).
 * KWD/BHD/OMR use 3 (fils are used).
 */
const CURRENCY_DECIMALS: Record<string, number> = {
  IQD: 0,
  USD: 2,
  EUR: 2,
  GBP: 2,
  SAR: 2,
  AED: 2,
  QAR: 2,
  JOD: 3,
  KWD: 3,
  BHD: 3,
  OMR: 3,
};

/**
 * Locale-aware currency labels for the project's supported currencies.
 * Outer key: currency code. Inner key: locale ("en" | "ar" | "ku").
 *
 * IMPORTANT:
 * - For English dashboard we prefer ISO codes (IQD / USD).
 * - For Arabic/Kurdish dashboard we prefer localized currency names.
 */
const CURRENCY_SYMBOLS: Record<string, Record<string, string>> = {
  IQD: { en: "IQD", ar: "د.ع", ku: "IQD" },
  USD: { en: "$", ar: "دولار", ku: "$" },
  EUR: { en: "€", ar: "يورو", ku: "€" },
  GBP: { en: "£", ar: "إسترليني", ku: "£" },
  SAR: { en: "SAR", ar: "ر.س", ku: "SAR" },
  AED: { en: "AED", ar: "د.إ", ku: "AED" },
  KWD: { en: "KWD", ar: "د.ك", ku: "KWD" },
  BHD: { en: "BHD", ar: "د.ب", ku: "BHD" },
  OMR: { en: "OMR", ar: "ر.ع", ku: "OMR" },
  QAR: { en: "QAR", ar: "ر.ق", ku: "QAR" },
  JOD: { en: "JOD", ar: "د.أ", ku: "JOD" },
};

// ─── Helper exports ───────────────────────────────────────────────────────────

/**
 * Returns the standard number of decimal places for a currency code.
 * Falls back to 2 for unknown currencies.
 *
 * @example
 * getCurrencyDecimals("IQD") // 0
 * getCurrencyDecimals("USD") // 2
 * getCurrencyDecimals("KWD") // 3
 */
export function getCurrencyDecimals(currency: string): number {
  return CURRENCY_DECIMALS[currency.toUpperCase()] ?? 2;
}

/**
 * Returns the display symbol/label for a currency in a given locale.
 * Falls back to Intl.NumberFormat symbol extraction for unknown currencies.
 *
 * @example
 * getCurrencySymbol("IQD", "en")  // "IQD"
 * getCurrencySymbol("IQD", "ar")  // "د.ع"
 * getCurrencySymbol("USD", "en")  // "$"
 * getCurrencySymbol("USD", "ar")  // "دولار"
 */
export function getCurrencySymbol(currency: string, locale = "en"): string {
  const code = currency.toUpperCase();
  let localeKey = "en";
  if (locale === "ar") localeKey = "ar";
  else if (locale === "ku") localeKey = "ku";

  if (CURRENCY_SYMBOLS[code]?.[localeKey]) {
    return CURRENCY_SYMBOLS[code][localeKey];
  }

  // Fallback: extract symbol via Intl
  try {
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      currencyDisplay: "symbol",
    }).formatToParts(0);
    const symbolPart = parts.find((p) => p.type === "currency");
    return symbolPart?.value ?? code;
  } catch {
    return code;
  }
}

// ─── formatMoney ──────────────────────────────────────────────────────────────

export interface FormatMoneyOptions {
  /**
   * Prepend an explicit `+` for positive amounts and `-` for negative.
   * The sign is placed before the currency symbol/code if applicable.
   * Default: false.
   */
  signed?: boolean;

  /**
   * Always display the absolute value (Math.abs). When combined with
   * `signed`, the sign still reflects the original value's polarity.
   * Default: false.
   */
  absolute?: boolean;

  /**
   * Override the automatically-detected decimal places for this currency.
   * Useful when displaying transaction amounts that must always show cents.
   */
  decimals?: number;

  /**
   * How to display the currency label alongside the number.
   * - "code"   → ISO code, e.g. "IQD" or "USD"  (default)
   * - "symbol" → locale-aware symbol, e.g. "$" or "£"
   * - "none"   → plain formatted number with no currency label
   */
  display?: "symbol" | "code" | "none";

  /**
   * When `display` is "code", position the code before or after the number.
   * Ignored when `display` is "symbol" (symbols follow locale convention).
   * Default: "after".
   */
  codePosition?: "before" | "after";

  /**
   * BCP 47 locale tag for Intl number formatting.
   * Passing "ar" automatically uses Arabic-Indic numerals ("ar-IQ").
   * Default: "en".
   */
  locale?: string;

  /**
   * Use compact notation for large numbers.
   * e.g. 1,234,567 → "1.2M",  980,300 → "980K"
   * Default: false.
   */
  compact?: boolean;
}

type MoneyDisplay = NonNullable<FormatMoneyOptions["display"]>;

/**
 * Format a monetary amount for display, with full control over sign,
 * decimals, currency label style, locale, and compact notation.
 *
 * Designed as the single source of truth for all currency display in the
 * accounting and ledger features. Does not mutate the existing `formatCurrency`
 * function which is used by contracts and housing.
 *
 * @example
 * // Cash-flow card (signed, IQD, 0 decimals)
 * formatMoney(-3780500, "IQD", { signed: true })
 * // → "-3,780,500 IQD"
 *
 * @example
 * // Transaction item (signed, 2 decimal places)
 * formatMoney(1234.56, "USD", { signed: true, decimals: 2, display: "symbol" })
 * // → "+$1,234.56"
 *
 * @example
 * // Category card (unsigned absolute value)
 * formatMoney(-3780500, "IQD", { absolute: true })
 * // → "3,780,500 IQD"
 *
 * @example
 * // Compact mode for charts
 * formatMoney(1234567, "IQD", { compact: true })
 * // → "1.2M IQD"
 *
 * @example
 * // Arabic locale
 * formatMoney(3780500, "IQD", { locale: "ar" })
 * // → "٣٬٧٨٠٬٥٠٠ د.ع"
 */
export function formatMoney(
  amount: NullableNumericValue,
  currency: string,
  options: FormatMoneyOptions = {}
): string {
  // ── Guard: null / undefined / NaN ────────────────────────────────────────
  if (amount === null || amount === undefined) return "";
  const parsed = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (Number.isNaN(parsed)) return "";
  // Normalize -0 → 0 so Intl never produces the string "-0".
  const raw = parsed === 0 ? 0 : parsed;

  const {
    signed = false,
    absolute = false,
    decimals,
    display,
    codePosition = "after",
    locale = "en",
    compact = false,
  } = options;

  const code = currency.toUpperCase();

  // ── Resolve decimal places ────────────────────────────────────────────────
  const fractionDigits = decimals ?? getCurrencyDecimals(code);

  // ── Sign prefix ───────────────────────────────────────────────────────────
  // Determine before applying absolute so we always reflect the real polarity.
  let signPrefix = "";
  if (signed) {
    signPrefix = raw >= 0 ? "+" : "-";
  }

  // ── Absolute value ────────────────────────────────────────────────────────
  const value = absolute || (signed && raw < 0) ? Math.abs(raw) : raw;

  // ── Locale tag ────────────────────────────────────────────────────────────
  // We always keep digits in English (0-9), regardless of dashboard language.
  // Currency label is handled separately via `getCurrencySymbol(code, locale)`.
  const localeTag = "en";

  // ── Format the number ─────────────────────────────────────────────────────
  const intlOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  };
  if (compact) {
    intlOptions.notation = "compact";
    intlOptions.compactDisplay = "short";
  }

  let formatted: string;
  try {
    formatted = new Intl.NumberFormat(localeTag, intlOptions).format(value);
  } catch {
    formatted = value.toFixed(fractionDigits);
  }

  // ── Assemble with currency label ──────────────────────────────────────────
  const resolvedDisplay: MoneyDisplay =
    display ?? (locale === "en" ? "code" : "symbol");

  return assembleMoney(
    signPrefix,
    formatted,
    code,
    resolvedDisplay,
    codePosition,
    locale
  );
}

function assembleMoney(
  signPrefix: string,
  formatted: string,
  code: string,
  display: "symbol" | "code" | "none",
  codePosition: "before" | "after",
  locale: string
): string {
  if (display === "none") {
    return `${signPrefix}${formatted}`;
  }

  if (display === "symbol") {
    const symbol = getCurrencySymbol(code, locale);
    // Word-length symbols (IQD, SAR …) and RTL locales go after the number.
    // Single-char symbols ($, €, £) go before in LTR.
    const isWordSymbol = symbol.length > 1;
    if (locale === "ar" || isWordSymbol) {
      return `${signPrefix}${formatted} ${symbol}`;
    }
    return `${signPrefix}${symbol}${formatted}`;
  }

  // display === "code"
  if (codePosition === "before") {
    return `${signPrefix}${code} ${formatted}`;
  }
  return `${signPrefix}${formatted} ${code}`;
}
