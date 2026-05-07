import { cn } from "../../lib/utils";
import React, { HTMLAttributes } from "react";

interface ValidationErrorProps
  extends HTMLAttributes<Omit<HTMLSpanElement, "className">> {
  message: string;
  className?: string;
}

const ValidationError = ({
  message,
  className,
  ...props
}: ValidationErrorProps) => {
  return (
    <span {...props} className={cn("text-xs text-red-500", className)}>
      {message}
    </span>
  );
};

export default ValidationError;
