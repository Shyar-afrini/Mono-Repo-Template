"use client";

import { useSyncExternalStore } from "react";
import type * as React from "react";

export const detectBrowser = () => {
  if (!navigator) return undefined;

  if (navigator.userAgent.indexOf("Chrome") !== -1) {
    return "Chrome";
  } else if (navigator.userAgent.indexOf("Firefox") !== -1) {
    return "Firefox";
  } else if (navigator.userAgent.indexOf("Safari") !== -1) {
    return "Safari";
  }
};

export const isBrowser = typeof window !== "undefined";
export function ensurePlatformSuffix(apiUrl: string) {
  return apiUrl.endsWith("/platform") ? apiUrl : `${apiUrl}/platform`;
}

export function mergeRefs<T>(...refs: React.Ref<T>[]): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref !== null) {
        if (typeof ref === "object" && ref !== null && "current" in ref) {
          (ref as any).current = value;
        }
      }
    });
  };
}

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/[. )(]/g, "-") // Replace spaces and brackets -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

export const copyToClipboard = (text: string) => {
  try {
    navigator.clipboard.writeText(text);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to copy to clipboard");
  }
};
