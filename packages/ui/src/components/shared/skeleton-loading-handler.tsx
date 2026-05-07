import React from "react";
import { Skeleton } from "../shadcn/ui/skeleton";
import { cn } from "../../lib/utils";

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean;
  count?: number;
  children: React.ReactNode;
  customSkeleton?: React.ReactNode;
}
const SkeletonLoadingHandler = ({
  isLoading,
  count,
  className,
  children,
  customSkeleton,
  ...props
}: SkeletonLoaderProps) => {
  // If customSkeleton is provided, use it instead of the default skeleton
  if (isLoading && customSkeleton) {
    return (
      <div
        className={cn("flex w-full min-h-0 flex-col", className)}
        {...props}
      >
        {customSkeleton}
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        {Array.from({ length: count ?? 0 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return <>{children}</>;
};

export default SkeletonLoadingHandler;
