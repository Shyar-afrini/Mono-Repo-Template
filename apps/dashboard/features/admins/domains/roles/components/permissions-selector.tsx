"use client";

import { Grid, Flex, Checkbox, Text, Title, cn } from "@mono-repo-template/ui";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useEffect } from "react";
import { Eye, Plus, Trash2, Shield } from "lucide-react";

interface PermissionsSelectorProps {
  allPermissions: string[];
  selectedPermissions: Set<string>;
  onToggle: (permission: string) => void;
}

interface GroupCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  onCheckedChange: () => void;
}

const GroupCheckbox = ({ checked, indeterminate, onCheckedChange }: GroupCheckboxProps) => {
  const checkboxRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (checkboxRef.current && indeterminate) {
      // Set aria-checked to mixed for accessibility
      checkboxRef.current.setAttribute('aria-checked', 'mixed');
      // Add data attribute for styling
      checkboxRef.current.setAttribute('data-indeterminate', 'true');
    } else if (checkboxRef.current) {
      checkboxRef.current.removeAttribute('aria-checked');
      checkboxRef.current.removeAttribute('data-indeterminate');
    }
  }, [indeterminate]);

  return (
    <Checkbox
      ref={checkboxRef}
      checked={checked && !indeterminate}
      onCheckedChange={onCheckedChange}
      className={cn(
        "size-5",
        indeterminate && "data-[indeterminate=true]:bg-primary/50 data-[indeterminate=true]:border-primary"
      )}
    />
  );
};

const PermissionsSelector = ({
  allPermissions,
  selectedPermissions,
  onToggle,
}: PermissionsSelectorProps) => {
  const t = useTranslations("roles.assignPermissions.permissions");

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, string[]>();

    for (const permission of allPermissions) {
      const [resource] = permission.split(":");
      if (!groups.has(resource)) {
        groups.set(resource, []);
      }
      groups.get(resource)!.push(permission);
    }

    // Convert to array and sort
    const sortedGroups = Array.from(groups.entries()).map(
      ([resource, permissions]) => ({
        resource,
        permissions: [...permissions].sort((a, b) => a.localeCompare(b)),
      })
    );
    return sortedGroups.sort((a, b) =>
      a.resource.localeCompare(b.resource, undefined, { sensitivity: "base" })
    );
  }, [allPermissions]);

  const getActionTranslation = (action: string) => {
    switch (action) {
      case "read":
        return t("actions.read");
      case "write":
        return t("actions.write");
      case "delete":
        return t("actions.delete");
      default:
        return action;
    }
  };

  const getResourceTranslation = (resource: string) => {
    // Handle resources with underscores (e.g., rent_contract -> rentcontract)
    const resourceKey = resource.replace(/_/g, "");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const translation = t(`resources.${resourceKey}` as any);
      return translation;
    } catch {
      return resource;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "read":
        return Eye;
      case "write":
        return Plus;
      case "delete":
        return Trash2;
      default:
        return Shield;
    }
  };

  const getActionColor = (action: string, isChecked: boolean) => {
    const opacity = isChecked ? "10" : "5";
    switch (action) {
      case "read":
        return `dark:bg-blue-400/${opacity} bg-blue-500/${opacity} border dark:border-blue-500/20 border-blue-500/30`;
      case "write":
        return `dark:bg-green-400/${opacity} bg-green-500/${opacity} border dark:border-green-500/20 border-green-500/30`;
      case "delete":
        return `dark:bg-red-400/${opacity} bg-red-500/${opacity} border dark:border-red-500/20 border-red-500/30`;
      default:
        return "dark:bg-zinc-900 bg-zinc-200 border dark:border-zinc-800 border-zinc-300";
    }
  };

  const getActionIconColor = (action: string) => {
    switch (action) {
      case "read":
        return "text-blue-500";
      case "write":
        return "text-green-500";
      case "delete":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  // Check if all permissions in a group are selected
  const isGroupFullySelected = (groupPermissions: string[]) => {
    return groupPermissions.every((perm) => selectedPermissions.has(perm));
  };

  // Check if some permissions in a group are selected (indeterminate state)
  const isGroupPartiallySelected = (groupPermissions: string[]) => {
    const selectedCount = groupPermissions.filter((perm) =>
      selectedPermissions.has(perm)
    ).length;
    return selectedCount > 0 && selectedCount < groupPermissions.length;
  };

  // Check if all permissions are selected
  const isAllSelected = useMemo(() => {
    return allPermissions.every((perm) => selectedPermissions.has(perm));
  }, [allPermissions, selectedPermissions]);

  // Check if some permissions are selected (indeterminate state)
  const isPartiallySelected = useMemo(() => {
    const selectedCount = allPermissions.filter((perm) =>
      selectedPermissions.has(perm)
    ).length;
    return selectedCount > 0 && selectedCount < allPermissions.length;
  }, [allPermissions, selectedPermissions]);

  // Toggle all permissions in a group
  const handleGroupToggle = (groupPermissions: string[]) => {
    const allSelected = isGroupFullySelected(groupPermissions);
    groupPermissions.forEach((permission) => {
      if (allSelected) {
        // Unselect all if all are selected
        if (selectedPermissions.has(permission)) {
          onToggle(permission);
        }
      } else {
        // Select all if not all are selected
        if (!selectedPermissions.has(permission)) {
          onToggle(permission);
        }
      }
    });
  };

  // Toggle all permissions globally
  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      // Unselect all
      allPermissions.forEach((permission) => {
        if (selectedPermissions.has(permission)) {
          onToggle(permission);
        }
      });
    } else {
      // Select all
      allPermissions.forEach((permission) => {
        if (!selectedPermissions.has(permission)) {
          onToggle(permission);
        }
      });
    }
  };

  return (
    <Flex direction="column" gap={4} className="w-full">
      {/* Global Select All */}
      <Flex
        direction="row"
        align="center"
        gap={3}
        className="w-full pb-3 border-b"
      >
        <GroupCheckbox
          checked={isAllSelected}
          indeterminate={isPartiallySelected}
          onCheckedChange={handleSelectAllToggle}
        />
        <Text
          className="text-sm font-semibold dark:text-card-foreground text-zinc-900 cursor-pointer"
        >
          {t("selectAllPermissions")}
        </Text>
      </Flex>

      {groupedPermissions.map((group) => {
        const groupFullySelected = isGroupFullySelected(group.permissions);
        const groupPartiallySelected = isGroupPartiallySelected(group.permissions);

        return (
          <Flex
            key={group.resource}
            direction="column"
            gap={2}
            className="w-full"
          >
            <Flex direction="row" align="center" gap={3}>
              <GroupCheckbox
                checked={groupFullySelected}
                indeterminate={groupPartiallySelected}
                onCheckedChange={() => handleGroupToggle(group.permissions)}
              />
              <Title className="text-sm font-medium dark:text-card-foreground text-zinc-900">
                {getResourceTranslation(group.resource)}
              </Title>
              {/* <Text
                className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
              >
                {t("selectAll")}
              </Text> */}
            </Flex>
          <Grid
            cols={3}
            gap={3}
            className="w-full grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
          >
            {group.permissions.map((permission) => {
              const [, action] = permission.split(":");
              const isChecked = selectedPermissions.has(permission);
              const ActionIcon = getActionIcon(action);
              const colorClass = getActionColor(action, isChecked);
              const iconColorClass = getActionIconColor(action);

              return (
                <Flex
                  key={permission}
                  direction="row"
                  align="center"
                  justify="between"
                  gap={3}
                  className={cn(
                    "w-full p-3 rounded-lg border transition-colors cursor-pointer",
                    colorClass,
                    "hover:opacity-80"
                  )}
                  onClick={() => onToggle(permission)}
                >
                  <Flex
                    direction="row"
                    align="center"
                    gap={3}
                    className="flex-1"
                  >
                    <Flex
                      direction="row"
                      align="center"
                      justify="center"
                      className={cn("p-4 rounded-lg shrink-0", colorClass)}
                    >
                      <ActionIcon size={16} className={iconColorClass} />
                    </Flex>
                    <Flex direction="column" gap={1} className="flex-1 min-w-0">
                      <Text className="text-sm font-medium dark:text-card-foreground text-zinc-900">
                        {getResourceTranslation(group.resource)}
                      </Text>
                      <Text className="text-xs dark:text-muted-foreground text-zinc-600">
                        {getActionTranslation(action)}
                      </Text>
                    </Flex>
                  </Flex>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => onToggle(permission)}
                    onClick={(e) => e.stopPropagation()}
                    className="size-5"
                  />
                </Flex>
              );
            })}
            </Grid>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default PermissionsSelector;
