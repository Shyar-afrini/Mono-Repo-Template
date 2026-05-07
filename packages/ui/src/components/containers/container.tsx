import React, { forwardRef, HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ContainerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  className?: string;
  children?: React.ReactNode;
}
const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className={cn(``, className)} ref={ref} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = "Container";
export default Container;
