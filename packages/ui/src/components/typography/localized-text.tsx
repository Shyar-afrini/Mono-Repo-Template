import React from "react";
import { HTMLAttributes, ReactNode } from "react";

export interface LocalizedTextProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children?: ReactNode;
  text?: string;
}

const LocalizedText = ({
  className,
  children,
  text,
  ...props
}: LocalizedTextProps) => {
  return (
    <span className={className} {...props}>
      {children || text}
    </span>
  );
};

export default LocalizedText;
