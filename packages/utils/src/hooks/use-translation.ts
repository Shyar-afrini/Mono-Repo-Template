/**
 * Creates a simple translation utility that works with any i18n library
 * This provides a type-safe wrapper around translation functions
 */
export const createTranslationWrapper = <T extends (...args: any[]) => any>(
  useTranslationsFn: T
) => {
  return () => {
    const t = useTranslationsFn();

    // Generic translate function that accepts string keys and values
    const translate = (
      key: string,
      values?: Record<string, string | number>
    ) => {
      try {
        return (t as any)(key, values);
      } catch (error) {
        console.warn(`Translation failed for key: ${key}`, error);
        return key; // Fallback to the key itself
      }
    };

    return { t, translate };
  };
};

/**
 * Simple utility to create a safe translation function
 * Can be used in both server and client components
 */
export const createSafeTranslate = (translateFn: any) => {
  return (key: string, values?: Record<string, string | number>) => {
    try {
      return translateFn(key, values);
    } catch (error) {
      console.warn(`Translation failed for key: ${key}`, error);
      return key;
    }
  };
};
