import { cn } from "../../lib/utils";
import React from "react";
// @ts-ignore
// import TitleStyles from './Title.module.css'

interface Props {
  className?: string;
  level?: 1 | 2 | 3 | 4 | 5;
  children: any;
  style?: React.CSSProperties;
}

function Title({ className, level = 1, children, style }: Readonly<Props>) {
  const CustomTag: any = `h${level}`;

  return (
    <CustomTag style={style} className={cn("", className)}>
      {children}
    </CustomTag>
  );
}

export default Title;
