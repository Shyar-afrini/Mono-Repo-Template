import { cn } from "../../lib/utils";
import React from "react";
// @ts-ignore
// import LinkStyles from './Link.module.css'

interface Props {
  children?: React.ReactNode;
  target?: "_blank" | "_self" | "_parent" | "_top" | "framename";
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: any;
}

function Link({
  children,
  target = "_blank",
  href,
  className,
  onClick,
  style,
}: Readonly<Props>) {
  return (
    <a
      onClick={onClick}
      href={href}
      target={target}
      rel="noopener noreferrer"
      style={style}
      className={cn("", className)}
    >
      {children}
    </a>
  );
}

export default Link;
