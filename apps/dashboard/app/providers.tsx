"use client";
import { NavigationHistoryTracker } from "@/components/navigation-history-tracker";
import { PermissionsProvider } from "@/components/providers/permissions-provider";
import { PWAInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { ThemeProvider } from "@/components/theme-provider";
import { PusherProvider } from "@/contexts/pusher-context";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { setApiBaseURL, setAuthBaseURL } from "@mono-repo-template/axios-client";
import { ENVIRONMENT_CONSTANTS } from "@mono-repo-template/common";
import type { I18nMessages } from "@mono-repo-template/types";
import { Container, DirectionProvider, Toaster } from "@mono-repo-template/ui";
import { getTextDirection } from "@mono-repo-template/utils";
import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    browserQueryClient ??= makeQueryClient();
    return browserQueryClient;
  }
}

type Props = {
  children: React.ReactNode;
  locale: string;
  messages: I18nMessages;
};

function ProvidersContent({ children, locale, messages }: Readonly<Props>) {
  const queryClient = getQueryClient();
  const direction = getTextDirection(locale);

  useEffect(() => {
    setApiBaseURL(process.env.NEXT_PUBLIC_API_ENDPOINT!);
    setAuthBaseURL(process.env.NEXT_PUBLIC_API_ENDPOINT!);
  }, []);

  const pathname = usePathname();

  return (
    <NextIntlClientProvider
      locale={locale as "en" | "ar" | "ku"}
      messages={messages}
      timeZone="UTC"
    >
      {!!ENVIRONMENT_CONSTANTS.SHOW_ACTIVE_PATH_NAME && (
        <Container className="p-3 rounded-lg bg-muted text-muted-foreground absolute bottom-4 left-1/2 -translate-x-1/2 text-xs mx-auto z-9999">
          {pathname}
        </Container>
      )}
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PusherProvider>
            <Toaster />
            <PermissionsProvider>
              <DirectionProvider dir={direction}>
                <NavigationHistoryTracker />
                {children}
                <PWAInstallPrompt />
              </DirectionProvider>
            </PermissionsProvider>
          </PusherProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}

export default function Providers({
  children,
  locale,
  messages,
}: Readonly<Props>) {
  return (
    <ProvidersContent locale={locale} messages={messages}>
      {children}
    </ProvidersContent>
  );
}
