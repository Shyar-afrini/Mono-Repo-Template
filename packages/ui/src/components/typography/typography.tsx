// @ts-ignore
import { cn } from "../../lib/utils";
import I18nText from "./i18n-text";
import Link from "./link";
import LocalizedText from "./localized-text";
import Text from "./text";
import Title from "./title";

function Typography({ children, className, tag = "div", style }: any) {
  let CustomTag: any = `${tag}`;
  return (
    <CustomTag style={style} className={cn("", className)}>
      {children}
    </CustomTag>
  );
}

Typography.Title = Title;
Typography.Text = Text;
Typography.Link = Link;
Typography.I18nText = I18nText;
Typography.LocalizedText = LocalizedText;

export default Typography;
