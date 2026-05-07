"use client";

import {
  Container,
  Flex,
  LocalizedText,
  Text,
  AnimatedButton,
  ScrollArea,
  ScrollBar,
} from "@mono-repo-template/ui";
import { getBookmarks, removeBookmark } from "@/utils/bookmarks";
import { getPageMetadata } from "@/utils/navigation-metadata";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Star, X } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import type { Bookmark } from "@/utils/bookmarks";
import { createAuthClient } from "@mono-repo-template/auth";

const FavoritePages = () => {
  const t = useTranslations("home.favoritePages");
  const tSidebar = useTranslations("sidebar");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const authClient = createAuthClient();
  const { data: currentUser } = authClient.getCurrentUser();

  // Load bookmarks and listen for changes
  useEffect(() => {
    const loadBookmarks = () => {
      setBookmarks(getBookmarks(currentUser?.id));
    };

    loadBookmarks();

    // Listen for bookmark changes
    if (globalThis.window) {
      globalThis.window.addEventListener("bookmarks-changed", loadBookmarks);
      return () => {
        globalThis.window?.removeEventListener(
          "bookmarks-changed",
          loadBookmarks
        );
      };
    }
  }, [currentUser?.id]);

  // Get metadata for each bookmark
  const bookmarksWithMetadata = useMemo(() => {
    return bookmarks.map((bookmark) => {
      const metadata = getPageMetadata(bookmark.path, tSidebar);
      return {
        ...bookmark,
        title: metadata?.title || bookmark.title,
        icon: metadata?.icon || undefined,
      };
    });
  }, [bookmarks, tSidebar]);

  const handleRemove = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeBookmark(path, currentUser?.id);
  };

  if (bookmarksWithMetadata.length === 0) {
    return (
      <Container className="w-full h-full dark:bg-zinc-900 bg-zinc-50 rounded-2xl p-6 flex flex-col">
        <Flex
          direction="column"
          gap={4}
          className="flex-1 justify-start w-full"
        >
          <Text className="text-base font-semibold dark:text-foreground text-zinc-600">
            <LocalizedText text={t("title")} />
          </Text>
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap={2}
            className="py-8"
          >
            <Star size={32} className="text-muted-foreground" />
            <Text className="text-sm dark:text-muted-foreground text-zinc-600 text-center">
              <LocalizedText text={t("empty")} />
            </Text>
            <Text className="text-xs dark:text-muted-foreground text-zinc-600 text-center">
              <LocalizedText text={t("emptyDescription")} />
            </Text>
          </Flex>
        </Flex>
      </Container>
    );
  }

  return (
    <Container className="w-full h-full dark:bg-zinc-900 bg-zinc-50 rounded-2xl p-6 flex flex-col">
      <Flex direction="column" gap={4} className="items-start">
        <Text className="text-base font-semibold dark:text-foreground text-zinc-600">
          <LocalizedText text={t("title")} />
        </Text>
        <ScrollArea className="max-h-[250px] w-full rounded-xl">
          <Flex direction="column" gap={2}>
            {bookmarksWithMetadata.map((bookmark) => {
              return (
                <Link key={bookmark.path} href={bookmark.path}>
                  <AnimatedButton
                    variant="ghost"
                    className="w-full justify-start gap-3 p-3 h-auto relative group"
                  >
                    {/* Star icon */}
                    <Flex
                      direction="row"
                      align="center"
                      justify="center"
                      className="p-3 dark:bg-linear-to-tl dark:from-zinc-700/60 dark:to-zinc-800/60 bg-linear-to-tl from-zinc-200/60 to-zinc-300/60 rounded-xl"
                    >
                      <Star
                        size={18}
                        className="fill-yellow-500 text-yellow-500"
                      />
                    </Flex>

                    {/* Title and remove button */}
                    <Flex
                      direction="column"
                      align="start"
                      gap={1}
                      className="flex-1 min-w-0"
                    >
                      <Text className="text-sm font-medium text-foreground truncate w-full text-start">
                        {bookmark.title}
                      </Text>
                    </Flex>

                    {/* Remove button */}
                    <AnimatedButton
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto w-auto shrink-0"
                      onClick={(e) => handleRemove(bookmark.path, e)}
                      aria-label={t("remove")}
                    >
                      <X size={14} className="text-muted-foreground" />
                    </AnimatedButton>
                  </AnimatedButton>
                </Link>
              );
            })}
          </Flex>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </Flex>
    </Container>
  );
};

export default FavoritePages;
