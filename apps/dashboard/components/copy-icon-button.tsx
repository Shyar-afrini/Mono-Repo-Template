"use client";

import { useEffect, useRef, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import { Check } from "lucide-react";
import { toast } from "@mono-repo-template/ui";
import { copyToClipboard } from "@mono-repo-template/utils";
import { useTranslations } from "next-intl";
import { cn } from "@mono-repo-template/utils";

interface CopyIconButtonProps {
  value?: string | null;
  copyIcon: StaticImageData;
  className?: string;
  iconClassName?: string;
  successDurationMs?: number;
}

const CopyIconButton = ({
  value,
  copyIcon,
  className,
  iconClassName,
  successDurationMs = 2000,
}: CopyIconButtonProps) => {
  const t = useTranslations("shared.placeholders");
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopy = () => {
    if (!value) return;

    try {
      copyToClipboard(value);
      toast.success(t("copied"));
      setIsCopied(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setIsCopied(false);
      }, successDurationMs);
    } catch (error) {
      toast.error(t("failedToCopy"));
      console.error(error);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <button
      type="button"
      className={cn(
        "shrink-0 size-8 dark:bg-zinc-800 bg-zinc-300 rounded-md cursor-pointer flex items-center justify-center",
        className
      )}
      onClick={handleCopy}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleCopy();
        }
      }}
      aria-label={isCopied ? t("copied") : t("copy")}
    >
      {isCopied ? (
        <Check className={cn("size-4 dark:text-white text-zinc-600", iconClassName)} />
      ) : (
        <Image
          src={copyIcon}
          alt="Copy Icon"
          className={cn("size-5", iconClassName)}
          draggable={false}
        />
      )}
    </button>
  );
};

export default CopyIconButton;
