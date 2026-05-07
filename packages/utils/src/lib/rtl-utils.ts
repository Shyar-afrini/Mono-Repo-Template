// Helper function to determine text direction
export function getTextDirection(locale: string): "ltr" | "rtl" {
  const rtlLocales = ["ar", "he", "fa", "ur", "ku-arab", "ku"]; // Add more RTL locales as needed
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
/*
 * @ params
 * @ returns "ltr" | "rtl"
 * @ description: get the direction of the locale
 * @ example: getDirection("ar") // "rtl"
 * @ example: getDirection("en") // "ltr"
 * @ example: getDirection("ku") // "rtl"
 * @ example: getDirection("ku-arab") // "rtl"
 */
export function getDirection(locale: string): "ltr" | "rtl" {
  return getTextDirection(locale);
}
// Helper to check if locale is RTL
export function isRTLLocale(locale: string): boolean {
  return getTextDirection(locale) === "rtl";
}

// Conditional class names based on direction
export function directionClasses(
  ltrClass: string,
  rtlClass: string,
  direction: "ltr" | "rtl"
) {
  return direction === "rtl" ? rtlClass : ltrClass;
}

export function localeBasedDirection(
  locale: string,
  ltr: string,
  rtl: string
): any {
  const direction = getTextDirection(locale);

  return direction === "rtl" ? rtl : ltr;
}

// Format numbers for locale (including Arabic-Indic numerals for RTL)
export function formatNumber(
  num: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  // For Arabic, use Arabic-Indic numerals
  if (locale === "ar") {
    return num.toLocaleString("ar-u-nu-arab", options);
  }
  return num.toLocaleString(locale, options);
}

// Format date for locale
export function formatDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };

  return date.toLocaleDateString(locale, defaultOptions);
}

// Format time for locale
export function formatTime(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  return date.toLocaleTimeString(locale, defaultOptions);
}
