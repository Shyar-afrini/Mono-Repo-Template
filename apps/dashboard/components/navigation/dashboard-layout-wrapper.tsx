"use client";

import { SidebarVariantProvider } from "@/contexts/sidebar-variant-context";
import SidebarWrapper from "./sidebar-wrapper";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AnimatedButton,
  Flex,
  SidebarInset,
  SidebarProvider,
} from "@mono-repo-template/ui";
import useUser from "@/store/user.store";
import { createAuthClient } from "@mono-repo-template/auth";
import { getTextDirection } from "@mono-repo-template/utils";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import ConfoundedIcon from "@/public/assets/icons/Confounded.svg";
import Image from "next/image";

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
}

const DashboardLayoutWrapper = ({ children }: DashboardLayoutWrapperProps) => {
  const locale = useLocale();
  const t = useTranslations("auth.disabledAccount");
  const router = useRouter();
  const userInfo = useUser((state) => state.userInfo);
  const clearUserInfo = useUser((state) => state.clearUserInfo);
  const authClient = createAuthClient();
  const { mutate: signOut, isPending: isLoggingOut } = authClient.signOut();
  const direction = getTextDirection(locale);
  const sidebarSide = direction === "rtl" ? "right" : "left";
  const isAccountDisabled = userInfo?.isActive === false;

  const handleBackToLogin = () => {
    signOut(undefined, {
      onSettled: () => {
        clearUserInfo();
        router.push(`/${locale}/auth/login`);
      },
    });
  };

  return (
    <SidebarVariantProvider>
      <SidebarProvider
        dir={direction}
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 76)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <SidebarWrapper side={sidebarSide} />
        <SidebarInset className="p-4 overflow-hidden">{children}</SidebarInset>
      </SidebarProvider>
      <AlertDialog open={isAccountDisabled} onOpenChange={() => { }}>
        <AlertDialogContent className="sm:max-w-[580px] dark:bg-zinc-950 bg-white dark:border-zinc-800 border-zinc-200 rounded-[20px] p-5 gap-[22px]">
          <AlertDialogHeader>
            <Flex direction="row" align="center" gap={1.5}>
              <Image src={ConfoundedIcon} alt="Confounded Icon" width={24} height={24} />
              <AlertDialogTitle className="dark:text-zinc-50 text-zinc-900 text-base font-semibold">
                {t("title")}
              </AlertDialogTitle>
            </Flex>
            <AlertDialogDescription className="dark:text-zinc-400 text-zinc-600 whitespace-pre-line text-sm font-semibold">
              {t("description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-start">
            <AnimatedButton
              variant="secondary"
              className="dark:bg-zinc-50 bg-zinc-900 dark:text-zinc-900 text-zinc-50 rounded-lg px-5 py-3 h-auto text-xs font-semibold hover:opacity-90"
              isLoading={isLoggingOut}
              loadingText={t("redirecting")}
              onClick={handleBackToLogin}
            >
              {t("backToLogin")}
            </AnimatedButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarVariantProvider>
  );
};

export default DashboardLayoutWrapper;
