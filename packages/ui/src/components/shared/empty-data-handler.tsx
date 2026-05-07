import { cn } from "../../lib/utils";
import React, { forwardRef } from "react";

interface FetchErrorHandlerProps extends React.HTMLAttributes<HTMLDivElement> {
  isEmpty: boolean;
  emptyDataMessage?: string;
  children: React.ReactNode;
  customEmptyDataComponent?: React.ReactNode;
}
const EmptyDataHandler = forwardRef<HTMLDivElement, FetchErrorHandlerProps>(
  (
    {
      isEmpty,
      emptyDataMessage,
      children,
      className,
      customEmptyDataComponent,
      ...props
    },
    ref
  ) => {
    if (isEmpty && customEmptyDataComponent) {
      return <>{customEmptyDataComponent}</>;
    }

    return isEmpty ? (
      <div ref={ref} className={cn(className)} {...props}>
        {customEmptyDataComponent ?? (
          <p className="text-sm text-muted-foreground">{emptyDataMessage}</p>
        )}
      </div>
    ) : (
      children
    );
  }
);

EmptyDataHandler.displayName = "EmptyDataHandler";

export default EmptyDataHandler;
