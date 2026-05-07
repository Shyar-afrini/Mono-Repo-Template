export type { Admin, Role } from "@mono-repo-template/types";
import type { Admin, Role } from "@mono-repo-template/types";

export type AdminWithRole = Admin & {
  role?: Role | null;
};

export type CreateAdminInput = {
  fullname: string;
  email: string;
  phoneNumber?: string | null;
  password: string;
  profilePhoto?: string | null;
  isActive: boolean;
  roleId?: string;
};

export type UpdateAdminInput = Partial<{
  fullname: string;
  email: string;
  phoneNumber: string | null;
  password: string;
  profilePhoto: string | null;
  isActive: boolean;
  roleId: string;
}>;
