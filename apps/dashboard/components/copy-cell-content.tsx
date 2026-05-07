import { useCopy } from "@mono-repo-template/common";
import { AnimatedButton, Flex, Text, toast } from "@mono-repo-template/ui";
import { copyToClipboard } from "@mono-repo-template/utils";
import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
const CopyCellContent = ({ value }: { value: string | null | undefined }) => {
  const { handleCopy } = useCopy();
  const t = useTranslations("shared.placeholders");
  const handleCopyClick = () => {
    try {
      copyToClipboard(value as string);
      toast.success(t("copied"));
      handleCopy();
    } catch (error) {
      toast.error(t("failedToCopy"));
      console.error(error);
    }
  };
  if (!value) return <Text small>-</Text>;

  return (
    <Flex
      direction="row"
      gap={1}
      align="center"
      justify="start"
      className="group"
    >
      <AnimatedButton
        variant="ghost"
        className={
          "max-h-8 py-2 px-2 cursor-pointer hidden group-hover:block transition-all duration-300 ease-in-out"
        }
        onClick={handleCopyClick}
      >
        <Copy size={8} className="size-3!" />
      </AnimatedButton>
      <Text className="text-sm">{value}</Text>
    </Flex>
  );
};

export default CopyCellContent;
