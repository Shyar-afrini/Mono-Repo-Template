import {
  ScrollArea,
  ScrollBar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  Skeleton,
} from "@mono-repo-template/ui";

/**
 * Skeleton for a single sidebar item
 */
export const SidebarItemSkeleton = () => {
  return (
    <SidebarMenuItem>
      <Skeleton className="w-full h-8 rounded-lg" />
    </SidebarMenuItem>
  );
};

/**
 * Skeleton for a sidebar group
 */
export const SidebarGroupSkeleton = () => {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        <Skeleton className="h-3 w-24 rounded-md" />
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarItemSkeleton />
          <SidebarItemSkeleton />
          <SidebarItemSkeleton />
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

/**
 * Skeleton for the entire sidebar content
 * Matches the structure of actual sidebar groups
 */
export const SidebarContentSkeleton = () => {
  // Show 6-7 skeleton groups to match typical sidebar structure
  const skeletonGroups = (
    <ScrollArea className="max-h-[calc(100vh-40px)]">
      {Array.from({ length: 7 }, (_, i) => (
        <SidebarGroupSkeleton key={`skeleton-group-${i}`} />
      ))}
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );

  return <>{skeletonGroups}</>;
};
