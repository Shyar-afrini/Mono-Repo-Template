"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import {
  AnimatedButton,
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Flex,
  Input,
  Label,
  LocalizedText,
  toast,
} from "@mono-repo-template/ui";
import { CheckCircle2, Eye, EyeClosed, KeyRound, XCircle } from "lucide-react";

import type { Admin } from "../../types";
import { createAdminsClient } from "../../services/admins.client";

type ChangeAdminPasswordDialogProps = {
  admin: Admin;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode | null;
};

type Requirement = {
  key: "length" | "uppercase" | "number" | "symbol";
  met: boolean;
  label: string;
};

const ChangeAdminPasswordDialog = ({
  admin,
  onSuccess,
  open,
  onOpenChange,
  trigger,
}: Readonly<ChangeAdminPasswordDialogProps>) => {
  const [isOpen, setIsOpen] = useState(false);
  const isControlled = typeof open === "boolean";
  const dialogOpen = isControlled ? open : isOpen;
  const [password, setPassword] = useState("");
  const adminsClient = useMemo(() => createAdminsClient(), []);
  const queryClient = useQueryClient();
  const { mutate: changePassword, isPending } =
    adminsClient.useChangeAdminPassword();
  const t = useTranslations("admins.dialogs.password");
  const tToasts = useTranslations("admins.toasts.password");

  const requirements = useMemo<Requirement[]>(() => {
    const uppercaseRegex = /[A-Z]/;
    const numberRegex = /\d/;
    const symbolRegex = /[^A-Za-z0-9]/;
    return [
      {
        key: "length",
        met: password.length >= 8,
        label: t("requirements.length"),
      },
      {
        key: "uppercase",
        met: uppercaseRegex.test(password),
        label: t("requirements.uppercase"),
      },
      {
        key: "number",
        met: numberRegex.test(password),
        label: t("requirements.number"),
      },
      {
        key: "symbol",
        met: symbolRegex.test(password),
        label: t("requirements.symbol"),
      },
    ];
  }, [password, t]);

  const isValid = requirements.every((requirement) => requirement.met);

  const handlePasswordChange = () => {
    changePassword(
      { id: admin.id, password },
      {
        onSuccess: () => {
          toast.success(tToasts("success"));
          queryClient.invalidateQueries({
            queryKey: adminsClient.getQueryKeys().getAdmins(),
          });
          setPassword("");
          setIsOpen(false);
          onSuccess?.();
        },
        onError: () => {
          toast.error(tToasts("error"));
        },
      }
    );
  };

  const [togglePasswordVisibility, setTogglePasswordVisibility] =
    useState(false);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(value) => {
        if (!isControlled) {
          setIsOpen(value);
        }
        if (!value) {
          setPassword("");
        }
        onOpenChange?.(value);
      }}
    >
      {trigger === null ? null : (
        <DialogTrigger asChild>
          {trigger ?? (
            <AnimatedButton
              variant="ghost"
              size="default"
              className="w-full flex items-center justify-start"
            >
              <KeyRound size={16} />
              <LocalizedText
                className="ms-2"
                text={t("trigger", { name: admin.fullname })}
              />
            </AnimatedButton>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <LocalizedText text={t("title", { name: admin.fullname })} />
          </DialogTitle>
          <DialogDescription>
            <LocalizedText text={t("description", { email: admin.email })} />
          </DialogDescription>
        </DialogHeader>

        <Flex direction="col" gap={3} className="py-2">
          <Flex direction="col" gap={2}>
            <Label htmlFor="admin-new-password" className="text-sm font-medium">
              <LocalizedText text={t("input.label")} />
            </Label>
            <Container className="relative">
              <Input
                id="admin-new-password"
                type={togglePasswordVisibility ? "text" : "password"}
                value={password}
                placeholder={t("input.placeholder")}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Button
                onClick={() =>
                  setTogglePasswordVisibility(!togglePasswordVisibility)
                }
                variant="ghost"
                className="absolute top-1 py-1 px-4 size-8 end-1"
              >
                {(() => {
                  if (togglePasswordVisibility) return <Eye size={18} />;
                  return <EyeClosed size={18} />;
                })()}
              </Button>
            </Container>
          </Flex>

          <Flex direction="col" gap={1}>
            {requirements.map((requirement) => (
              <Flex
                key={requirement.key}
                direction="row"
                align="center"
                gap={2}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  requirement.met ? " text-zinc-100" : " text-zinc-500"
                }`}
              >
                {requirement.met ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <XCircle size={14} />
                )}
                <LocalizedText text={requirement.label} />
              </Flex>
            ))}
          </Flex>
        </Flex>

        <DialogFooter>
          <AnimatedButton
            className="w-full"
            variant="default"
            onClick={handlePasswordChange}
            disabled={!isValid || isPending}
            isLoading={isPending}
            loadingText={t("submitting")}
          >
            <LocalizedText text={t("submit")} />
          </AnimatedButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeAdminPasswordDialog;
