"use client";

import { Star } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { isBookmarked, toggleBookmark } from "@/utils/bookmarks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";
import { createAuthClient } from "@mono-repo-template/auth";

interface NavBookmarkButtonProps {
  path: string;
  title: string;
  onToggle?: (isBookmarked: boolean) => void;
}

const NavBookmarkButton = ({
  path,
  title,
  onToggle,
}: NavBookmarkButtonProps) => {
  const t = useTranslations("home.bookmarks");
  const authClient = createAuthClient();
  const { data: currentUser } = authClient.getCurrentUser();
  const [bookmarked, setBookmarked] = useState(() => isBookmarked(path, currentUser?.id));

  // Listen for bookmark changes
  useEffect(() => {
    const handleBookmarkChange = () => {
      setBookmarked(isBookmarked(path, currentUser?.id));
    };

    if (globalThis.window) {
      globalThis.window.addEventListener(
        "bookmarks-changed",
        handleBookmarkChange
      );
      return () => {
        globalThis.window?.removeEventListener(
          "bookmarks-changed",
          handleBookmarkChange
        );
      };
    }
  }, [path, currentUser?.id]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const newState = toggleBookmark(path, title, undefined, currentUser?.id);
      setBookmarked(newState);
      onToggle?.(newState);
    },
    [path, title, onToggle, currentUser?.id]
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className="ms-auto p-0.5 rounded-md hover:bg-zinc-800 transition-colors flex items-center justify-center"
            aria-label={bookmarked ? t("remove") : t("add")}
          >
            <Star
              size={14}
              className={
                bookmarked
                  ? "fill-yellow-500 text-yellow-500"
                  : "text-muted-foreground"
              }
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {bookmarked ? t("remove") : t("add")}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NavBookmarkButton;
