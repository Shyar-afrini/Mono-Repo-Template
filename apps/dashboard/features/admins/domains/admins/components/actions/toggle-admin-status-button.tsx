"use client";

import { useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatedButton, LocalizedText, toast } from "@mono-repo-template/ui";
import { ShieldCheck, ShieldOff } from "lucide-react";

import type { Admin } from "../../types";
import { createAdminsClient } from "../../services/admins.client";

type ToggleAdminStatusButtonProps = {
  admin: Admin;
  setOpen: (open: boolean) => void;
};

const ToggleAdminStatusButton = ({
  admin,
  setOpen,
}: Readonly<ToggleAdminStatusButtonProps>) => {
  const adminsClient = useMemo(() => createAdminsClient(), []);
  const queryClient = useQueryClient();
  const t = useTranslations("admins");
  const tActions = useTranslations("admins.table.actions");

  const { mutate: toggleStatus, isPending } =
    adminsClient.useToggleAdminStatus();

  const actionKey = admin.isActive ? "deactivate" : "activate";
  const loadingKey = admin.isActive ? "deactivating" : "activating";

  const handleToggle = useCallback(() => {
    toggleStatus(
      { id: admin.id, isActive: admin.isActive },
      {
        onSuccess: () => {
          toast.success(t(`toasts.status.${actionKey}.success`));
          queryClient.invalidateQueries({
            queryKey: adminsClient.getQueryKeys().getAdmins(),
          });
          setOpen(false);
        },
        onError: () => {
          toast.error(t(`toasts.status.${actionKey}.error`));
        },
      }
    );
  }, [
    actionKey,
    admin.id,
    admin.isActive,
    adminsClient,
    queryClient,
    t,
    toggleStatus,
    setOpen,
  ]);

  return (
    <AnimatedButton
      variant="ghost"
      size="default"
      className="w-full flex items-center justify-start"
      onClick={handleToggle}
      disabled={isPending}
      isLoading={isPending}
      loadingText={tActions(loadingKey)}
    >
      {admin.isActive ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
      <LocalizedText className="ms-2" text={tActions(actionKey)} />
    </AnimatedButton>
  );
};

export default ToggleAdminStatusButton;
