import {
  AnimatedButton,
  cn,
  Container,
  Flex,
  Input,
  Label,
  LocalizedText,
  toast,
} from "@mono-repo-template/ui";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";
import ImageIcon from "@/public/assets/icons/image-icon.svg";
import Image from "next/image";
interface FileUploaderProps {
  type: "image" | "file";
  customLabel: string;
  accept: string;
  files: File[];
  setFiles: (files: File[]) => void;
  maxFiles?: number;
  existingFiles?: string[];
  onRemoveExisting?: (file: string) => Promise<void> | void;
  showPlaceholder?: boolean;
}
const FileUploader = ({
  type,
  customLabel,
  accept,
  setFiles,
  files,
  maxFiles,
  existingFiles = [],
  onRemoveExisting,
  showPlaceholder = true,
}: FileUploaderProps) => {
  const t = useTranslations("shared");
  const [removingFile, setRemovingFile] = useState<string | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const totalFiles = files.length + existingFiles.length;
      if (maxFiles && totalFiles >= maxFiles) {
        toast.error(t("fileUploader.maxFilesError", { maxFiles }));
        return;
      }
      setFiles([...files, file]);
    }
  };

  const ref = useRef<HTMLInputElement>(null);
  const handleRemoveExisting = async (fileUrl: string) => {
    if (!onRemoveExisting) {
      return;
    }
    try {
      setRemovingFile(fileUrl);
      await onRemoveExisting(fileUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setRemovingFile(null);
    }
  };
  const totalFilesCount = files.length + existingFiles.length;
  const canAddMore = !maxFiles || totalFilesCount < maxFiles;
  return (
    <Flex direction="column" gap={3} className={cn("w-full h-auto")}>
      {!customLabel ? (
        <Label>
          {maxFiles && maxFiles > 1
            ? t("fileUploader.label", { type: t(`fileUploader.${type}s`) })
            : t("fileUploader.label", { type: t(`fileUploader.${type}`) })}
        </Label>
      ) : (
        <Label>{customLabel}</Label>
      )}
      <Input
        className="hidden"
        ref={ref}
        type="file"
        accept={accept}
        onChange={handleFileChange}
      />
      <Flex
        direction="column"
        gap={4}
        align="center"
        justify="center"
        className="w-full dark:bg-zinc-900/50 bg-zinc-50 border dark:border-zinc-700/50 min-h-[100px] rounded-lg h-auto px-4 py-6"
      >
        <Flex direction="column" gap={2}>
          {showPlaceholder &&
            files.length === 0 &&
            existingFiles.length === 0 && (
              <Flex direction="column" gap={1} align="center" justify="center">
                <Image src={ImageIcon} alt="image" className="size-16" />
                <LocalizedText
                  text={t("fileUploader.fileUploadRules")}
                  className="dark:text-zinc-400 text-zinc-600 text-center text-xs"
                />
              </Flex>
            )}

          {existingFiles.length > 0 && (
            <Flex
              direction="row"
              gap={1}
              align="center"
              justify="center"
              className="flex-wrap w-full"
            >
              {existingFiles.map((fileUrl) => (
                <Container className="relative" key={fileUrl}>
                  <AnimatedButton
                    onClick={() => handleRemoveExisting(fileUrl)}
                    variant="ghost"
                    size="sm"
                    className="absolute -start-2 -top-2 size-6 dark:bg-zinc-900/50 bg-zinc-50"
                    disabled={removingFile === fileUrl}
                    isLoading={removingFile === fileUrl}
                  >
                    <X size={20} className="text-zinc-100" />
                  </AnimatedButton>
                  <Image
                    src={fileUrl}
                    alt="uploaded-preview"
                    className="size-20 rounded-lg object-cover"
                    width={64}
                    height={64}
                    unoptimized
                  />
                </Container>
              ))}
            </Flex>
          )}

          {files.length > 0 && (
            <Flex
              direction="row"
              gap={1}
              align="center"
              justify="center"
              className="flex-wrap w-full"
            >
              {files.map((file) => (
                <Container className="relative" key={file.name}>
                  <AnimatedButton
                    onClick={() => setFiles(files.filter((f) => f !== file))}
                    variant="ghost"
                    size="sm"
                    className="absolute -start-2 -top-2 size-6 dark:bg-zinc-900/50 bg-zinc-50"
                  >
                    <X size={20} className="text-zinc-100" />
                  </AnimatedButton>
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="size-20 rounded-lg object-cover"
                    width={64}
                    height={64}
                  />
                </Container>
              ))}
            </Flex>
          )}
        </Flex>
        {canAddMore && (
          <AnimatedButton
            onClick={() => ref.current?.click()}
            variant={"secondary"}
            size={"sm"}
            className=""
          >
            <Plus size={20} className="dark:text-zinc-400 text-zinc-600" />
            <LocalizedText
              text={t("fileUploader.label", {
                type: t(`fileUploader.${type}`),
              })}
            />
          </AnimatedButton>
        )}
      </Flex>
    </Flex>
  );
};

export default FileUploader;
