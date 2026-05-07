import { cn } from "../../lib/utils";
import React from "react";
// @ts-ignore
// import TextStyles from './Text.module.css'

export interface Props {
  validationError?: boolean;
  className?: string;
  children: any;
  style?: React.CSSProperties;
  type?: "default" | "secondary" | "success" | "warning" | "danger";
  disabled?: boolean;
  mark?: boolean;
  code?: boolean;
  keyboard?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  strong?: boolean;
  small?: boolean;
  span?: boolean;
  paragraph?: boolean;
}

function Text({
  validationError,
  className,
  children,
  style,
  type,
  disabled,
  mark,
  code,
  keyboard,
  underline,
  strikethrough,
  strong,
  small,
  span,
  paragraph,
}: Readonly<Props>) {
  if (validationError)
    return (
      <span
        className={cn(className, "text-red-500 text-xs my-0")}
        style={style}
      >
        {children}
      </span>
    );
  if (code)
    return (
      <code className={className} style={style}>
        {children}
      </code>
    );
  if (mark)
    return (
      <mark className={className} style={style}>
        {children}
      </mark>
    );
  if (keyboard)
    return (
      <kbd className={className} style={style}>
        {children}
      </kbd>
    );
  if (strong)
    return (
      <strong className={className} style={style}>
        {children}
      </strong>
    );
  if (small)
    return (
      <small className={className} style={style}>
        {children}
      </small>
    );
  if (underline)
    return (
      <u className={className} style={style}>
        {children}
      </u>
    );
  if (strikethrough)
    return (
      <s className={className} style={style}>
        {children}
      </s>
    );
  if (span)
    return (
      <span className={className} style={style}>
        {children}
      </span>
    );
  if (paragraph)
    return (
      <p className={className} style={style}>
        {children}
      </p>
    );
  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}

export default Text;
