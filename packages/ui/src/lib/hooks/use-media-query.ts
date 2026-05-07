import * as React from "react";

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: {
    defaultValue?: boolean;
    initializeWithValue?: boolean;
  } = {}
) {
  const [matches, setMatches] = React.useState(() => {
    if (initializeWithValue) {
      return typeof window !== "undefined"
        ? window.matchMedia(query).matches
        : defaultValue;
    }
    return defaultValue;
  });

  React.useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Triggered at the first client-side load and if query changes
    setMatches(matchMedia.matches);

    // Define listener callback
    function handleChange(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }

    // Listen matchMedia
    if (matchMedia.addListener) {
      matchMedia.addListener(handleChange);
    } else {
      matchMedia.addEventListener("change", handleChange);
    }

    return () => {
      if (matchMedia.removeListener) {
        matchMedia.removeListener(handleChange);
      } else {
        matchMedia.removeEventListener("change", handleChange);
      }
    };
  }, [query]);

  return matches;
}
