"use client";

import { LogOut, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  Avatar,
  AvatarFallback,
  AvatarImage,
  FetchErrorHandler,
  SkeletonLoadingHandler,
  EmptyDataHandler,
  Skeleton,
  AnimatedButton,
  LocalizedText,
} from "@mono-repo-template/ui";

import { createAuthClient } from "@mono-repo-template/auth";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import useUser from "@/store/user.store";
import { clearHistory } from "@/utils/navigation-history";
import { clearBookmarks } from "@/utils/bookmarks";
import { useQueryClient } from "@tanstack/react-query";

export function NavUser() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const authClient = createAuthClient();
  const queryClient = useQueryClient();
  const { mutate: signOut, isPending: isLoggingOut } = authClient.signOut();
  const { data: currentUser, isPending, isError } = authClient.getCurrentUser();
  const getUserAvatarLetters = (fullname: string) => {
    if (!fullname) return "";
    return fullname
      ?.split(" ")
      .map((name) => name[0])
      .join("");
  };

  const clearUserInfo = useUser((state) => state.clearUserInfo);

  const handleSignOut = () => {
    const userId = currentUser?.id;
    signOut(undefined, {
      onSuccess: () => {
        // Clear user-specific history and bookmarks before clearing user info
        if (userId) {
          clearHistory(userId);
          clearBookmarks(userId);
        }
        clearUserInfo();
        // invalidate user query
        queryClient.invalidateQueries({ queryKey: ["get-current-user"] });
        router.push("/");
      },
    });
  };

  const t = useTranslations("auth.login");

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <FetchErrorHandler isError={isError}>
            <SkeletonLoadingHandler
              isLoading={isPending}
              customSkeleton={<CustomerSidebarLoadingSkeleton />}
            >
              <EmptyDataHandler isEmpty={!currentUser}>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg grayscale">
                      <AvatarImage
                        src={"/avatars/shadcn.jpg"}
                        alt={currentUser?.fullname}
                      />
                      <AvatarFallback className="rounded-lg">
                        {getUserAvatarLetters(currentUser?.fullname ?? "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-start text-sm leading-tight">
                      <span className="truncate font-medium">
                        {currentUser?.fullname}
                      </span>
                      <span className="text-muted-foreground truncate text-xs">
                        {currentUser?.email}
                      </span>
                    </div>
                    <MoreVertical className="ms-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
              </EmptyDataHandler>
            </SkeletonLoadingHandler>
          </FetchErrorHandler>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg p-2"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={currentUser?.profilePhoto ?? ""}
                    alt={currentUser?.fullname ?? ""}
                  />
                  <AvatarFallback className="rounded-lg">
                    {getUserAvatarLetters(currentUser?.fullname ?? "")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-start text-sm leading-tight">
                  <span className="truncate font-medium">
                    {currentUser?.fullname}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {currentUser?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
              }}
              asChild
              className=" w-full text-white"
            >
              <AnimatedButton
                isLoading={isLoggingOut}
                onClick={handleSignOut}
                loadingText={t("loggingOut")}
                variant={"destructive"}
                className="hover:bg-destructive/80 focus:bg-destructive/90"
              >
                <LogOut />
                <LocalizedText text={t("logout")} />
              </AnimatedButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

const CustomerSidebarLoadingSkeleton = () => {
  return <Skeleton className="w-full h-12 rounded-lg" />;
};
