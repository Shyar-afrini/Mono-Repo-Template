"use client";

import { useEffect, useState } from "react";
import { Button, Container, Flex, Text } from "@mono-repo-template/ui";
import { Download, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const PROMPT_LAST_SHOWN_AT_KEY = "pwa_install_prompt_last_shown_at";
const PWA_INSTALLED_KEY = "pwa_installed";
const PROMPT_COOLDOWN_DAYS = 1;
const PROMPT_COOLDOWN_MS = PROMPT_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

const isStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  // Safari on iOS
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

const isPromptAllowedNow = () => {
  if (typeof window === "undefined") return false;
  if (isStandaloneMode()) return false;
  if (window.localStorage.getItem(PWA_INSTALLED_KEY) === "true") return false;

  const lastShownAt = window.localStorage.getItem(PROMPT_LAST_SHOWN_AT_KEY);
  if (!lastShownAt) return true;

  const elapsed = Date.now() - Number(lastShownAt);
  return elapsed >= PROMPT_COOLDOWN_MS;
};

const savePromptShownAt = () => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROMPT_LAST_SHOWN_AT_KEY, String(Date.now()));
};

export const PWAInstallPrompt = () => {
  const t = useTranslations("pwaInstallPrompt");
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAppInstalled = () => {
      window.localStorage.setItem(PWA_INSTALLED_KEY, "true");
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    const handler = (e: Event) => {
      if (!isPromptAllowedNow()) return;

      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
      savePromptShownAt();
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted" && typeof window !== "undefined") {
      window.localStorage.setItem(PWA_INSTALLED_KEY, "true");
    }

    savePromptShownAt();
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleDismiss = () => {
    savePromptShownAt();
    setShowInstallButton(false);
    setDeferredPrompt(null);
  };

  if (!showInstallButton) return null;

  return (
    <Container className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Container className="bg-background border border-border rounded-lg shadow-lg p-4">
        <Flex direction="row" align="center" justify="between" gap={4}>
          <Flex direction="column" gap={1} className="flex-1">
            <Text className="text-sm font-medium">{t("title")}</Text>
            <Text className="text-xs text-muted-foreground">
              {t("description")}
            </Text>
          </Flex>
          <Flex direction="row" gap={2}>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <X size={16} />
            </Button>
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="gap-2"
            >
              <Download size={16} />
              {t("action")}
            </Button>
          </Flex>
        </Flex>
      </Container>
    </Container>
  );
};
