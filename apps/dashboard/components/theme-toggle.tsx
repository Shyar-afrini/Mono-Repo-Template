"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { AnimatedButton } from "@mono-repo-template/ui";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <AnimatedButton variant="outline" size="icon">
        <Sun className="size-4" />
      </AnimatedButton>
    );
  }

  const currentTheme = theme === "system" ? resolvedTheme : theme;

  const handleToggle = () => {
    if (currentTheme === "dark") {
      setTheme("light");
    } else if (currentTheme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  return (
    <AnimatedButton
      variant="outline"
      size="icon"
      onClick={handleToggle}
      title={
        currentTheme === "dark"
          ? "Switch to light mode"
          : currentTheme === "light"
            ? "Switch to system mode"
            : "Switch to dark mode"
      }
    >
      {currentTheme === "dark" ? (
        <Moon className="size-4" />
      ) : currentTheme === "light" ? (
        <Sun className="size-4" />
      ) : (
        <Monitor className="size-4" />
      )}
    </AnimatedButton>
  );
}
