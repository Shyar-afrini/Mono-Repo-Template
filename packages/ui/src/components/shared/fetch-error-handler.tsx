import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

interface FetchErrorHandlerProps extends React.HTMLAttributes<HTMLDivElement> {
  isError: boolean;
  errorMessage?: string;
  isChromeExtension?: boolean;
  children: React.ReactNode;
  customErrorComponent?: React.ReactNode;
}
const FetchErrorHandler = forwardRef<HTMLDivElement, FetchErrorHandlerProps>(
  (
    {
      isError,
      errorMessage,
      children,
      className,
      customErrorComponent,
      ...props
    },
    ref
  ) => {
    return isError ? (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {customErrorComponent ?? (
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        )}
      </div>
    ) : (
      children
    );
  }
);

FetchErrorHandler.displayName = "FetchErrorHandler";

export default FetchErrorHandler;
