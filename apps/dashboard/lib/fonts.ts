import {
  Inter,
  Gilda_Display,
  Cal_Sans,
  Cairo,
  Noto_Kufi_Arabic,
  JetBrains_Mono
} from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const gildaDisplay = Gilda_Display({
  variable: "--font-gilda-display",
  subsets: ["latin"],
  weight: ["400"],
});

const calSans = Cal_Sans({
  variable: "--font-cal-sans",
  subsets: ["latin"],
  weight: ["400"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin"],
});

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["latin"],
  weight: ["400"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const getActiveFont = (locale: string) => {
  if (locale === "en") {
    return inter;
  } else if (locale === "ar") {
    return cairo;
  } else if (locale === "ku") {
    return notoKufiArabic;
  }
  return inter;
};

export { inter, gildaDisplay, calSans, cairo, notoKufiArabic, jetBrainsMono };
