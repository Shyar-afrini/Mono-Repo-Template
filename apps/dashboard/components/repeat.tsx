import React from "react";

interface RepeatProps {
  count: number;
  children: (index: number) => React.ReactNode;
}

export const Repeat = ({ count, children }: RepeatProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{children(index)}</React.Fragment>
      ))}
    </>
  );
};
