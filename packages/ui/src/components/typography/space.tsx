import React, { HTMLAttributes } from "react";

interface SpaceProps extends HTMLAttributes<HTMLSpanElement> {
  spaces?: number;
}
const Space = ({ spaces = 1, ...props }: SpaceProps) => {
  return <span {...props}>{" ".repeat(spaces)}</span>;
};

export default Space;
