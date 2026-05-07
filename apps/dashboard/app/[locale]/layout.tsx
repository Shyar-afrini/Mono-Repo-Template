import { routing } from "@/i18n/routing";
import { getActiveFont, jetBrainsMono } from "@/lib/fonts";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Providers from "../providers";
import { getTextDirection } from "@mono-repo-template/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "Template",
  description: "Template",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Template",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192x192.svg",
    apple: "/icon-192x192.svg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({
  children,
  params,
}: Readonly<Props>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Load messages for the current locale
  const messages = await getMessages();
  const direction = getTextDirection(locale);

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content"></meta>
      <body className={`${getActiveFont(locale).className} ${jetBrainsMono.variable} antialiased`}>
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
