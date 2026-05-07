/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  PaginationConstruct,
  PaginationQuery,
  SortOption,
  TResult,
} from '@mono-repo-template/backend/types';
import {
  constructPaginatedMetadata,
  constructPagination,
  CREATED_STATUS,
  ErrorCode,
  hash,
  NO_CONTENT_STATUS,
  OK_STATUS
} from '@mono-repo-template/backend/utils';
import {
  Admin,
  admins,
  AdminSession,
  adminSessions,
  and,
  asc,
  desc,
  DRIZZLE_PRIMARY_DB,
  DrizzleQueryError,
  eq,
  NewAdmin,
  not,
  Role,
  RolePermission,
  roles,
  sql,
  SQLWrapper,
  UpdateAdmin,
  type PrimaryDb,
} from '@mono-repo-template/database';
import { Inject, Injectable } from '@nestjs/common';
import { Validator } from 'database/validator';

@Injectable()
export class AdminsService {
  constructor(
    @Inject(DRIZZLE_PRIMARY_DB) private readonly db: PrimaryDb,
    private readonly validator: Validator,
  ) { }

  private readonly DEFAULT_LIMIT = 20;
  private readonly DEFAULT_OFFSET = 0;

  async getSuperAdmin(): Promise<TResult<Admin>> {
    try {
      const superAdminRole = await this.db.query.roles.findFirst({
        where: eq(roles.name, 'SuperAdmin'),
        columns: { id: true },
      });
      if (!superAdminRole) {
        return this.validator.notFound(ErrorCode.ADMIN_ROLE_NOT_FOUND);
      }
      const superAdmin = await this.db.query.admins.findFirst({
        where: eq(admins.roleId, superAdminRole.id),
      });
      if (!superAdmin) {
        return this.validator.notFound(ErrorCode.ADMIN_NOT_FOUND);
      }
      return {
        success: true,
        statusCode: OK_STATUS,
        data: superAdmin,
      };
    } catch (error: any) {
      if (error instanceof DrizzleQueryError) {
        return this.validator.queryError(error);
      }
      return this.validator.fail(error, "Failed to get super admin");
    }
  }

  async getAdmins(
    paginationParams: PaginationQuery | undefined,
    filters: string | undefined,
    sort: SortOption[] | undefined,
    currentAdminId: string,
  ): Promise<
    TResult<
      PaginationConstruct<
        Omit<Admin & { role: Pick<Role, 'name'> }, 'password'>[]
      >
    >
  > {
    try {
      const isRequesterSuperAdmin = await this.isSuperAdmin(currentAdminId);
      const { limit, offset } = constructPagination(
        paginationParams ?? {
          limit: this.DEFAULT_LIMIT.toString(),
          page: this.DEFAULT_OFFSET.toString(),
        },
      );

      const superAdminRole = await this.db.query.roles.findFirst({
        where: eq(roles.name, 'SuperAdmin'),
        columns: { id: true },
      });

      const superAdminFilter =
        superAdminRole && !isRequesterSuperAdmin
          ? not(eq(admins.roleId, superAdminRole.id))
          : undefined;

      const whereQuery = and(
        not(eq(admins.id, currentAdminId)),
        superAdminFilter,
      );

      const adminsFromDB = await this.db.query.admins.findMany({
        where: whereQuery,
        orderBy:
          sort?.length && sort?.length > 0
            ? sort.map(({ field, direction }) =>
              direction === 'asc'
                ? asc(admins[field as keyof typeof admins] as SQLWrapper)
                : desc(admins[field as keyof typeof admins] as SQLWrapper),
            )
            : undefined,
        columns: {
          password: false,
        },
        with: {
          role: {
            columns: {
              name: true,
            },
          },
        },
        limit,
        offset,
      });

      const totalCount = await this.getAdminsCount(filters, currentAdminId);
      // Adjust total count if needed, but getAdminsCount uses simple WHERE from searchAdmins.
      // Technically total count should also exclude SUPER_ADMIN.
      // I should update getAdminsCount too.

      return {
        success: true,
        statusCode: adminsFromDB.length > 0 ? OK_STATUS : NO_CONTENT_STATUS,
        data: this.constructPaginatedData(
          adminsFromDB.map((admin) => ({
            ...admin,
            role: {
              name: admin.role?.name || '',
            },
          })),
          totalCount.data ?? 0,
          limit ?? this.DEFAULT_LIMIT,
          offset ?? this.DEFAULT_OFFSET,
        ),
      };
    } catch (error: any) {
      if (error instanceof DrizzleQueryError) {
        return this.validator.queryError(error);
      }
      return this.validator.fail(error, "Failed to get admins");
    }
  }


  private constructPaginatedData(
    data: Omit<Admin & { role: Pick<Role, 'name'> }, 'password'>[],
    totalCount: number,
    limit: number,
    offset: number,
  ): PaginationConstruct<
    Omit<Admin & { role: Pick<Role, 'name'> }, 'password'>[]
  > {
    return {
      data,
      meta: constructPaginatedMetadata(totalCount, limit, offset),
    };
  }

  async getAdminsCount(
    filters: string | undefined,
    currentAdminId: string,
  ): Promise<TResult<number>> {
    try {
      const isRequesterSuperAdmin = await this.isSuperAdmin(currentAdminId);

      const superAdminRole = await this.db.query.roles.findFirst({
        where: eq(roles.name, 'SuperAdmin'),
        columns: { id: true },
      });

      const superAdminFilter =
        superAdminRole && !isRequesterSuperAdmin
          ? not(eq(admins.roleId, superAdminRole.id))
          : undefined;
      const whereQuery = and(
        superAdminFilter,
        not(eq(admins.id, currentAdminId)),
      );

      const totalCount = await this.db
        .select({ count: sql<string>`count(*)` })
        .from(admins)
        .where(whereQuery);
      return {
        success: true,
        statusCode: OK_STATUS,
        data: parseInt(totalCount[0].count, 10) ?? 0,
      };
    } catch (error: any) {
      if (error instanceof DrizzleQueryError) {
        return this.validator.queryError(error);
      }
      return this.validator.fail(error, "Failed to get admins count");
    }
  }

  async getAdminById(
    id: string,
    requesterId: string,
  ): Promise<
    TResult<
      Omit<Admin, 'password'> & {
        role: Pick<Role, 'name' | 'id'> | null;
      }
    >
  > {
    try {
      const requesterIsSuperAdmin = await this.isSuperAdmin(requesterId);
      const superAdminRole = await this.db.query.roles.findFirst({
        where: eq(roles.name, 'SuperAdmin'),
        columns: { id: true },
      });

      const admin = await this.db.query.admins.findFirst({
        where: eq(admins.id, id),
        columns: {
          password: false,
        },
        with: {
          role: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!admin) {
        return this.validator.notFound(ErrorCode.ADMIN_NOT_FOUND);
      }

      if (
        superAdminRole &&
        admin.roleId === superAdminRole.id &&
        !requesterIsSuperAdmin
      ) {
        return this.validator.notFound(ErrorCode.ADMIN_NOT_FOUND);
      }

      return {
        success: true,
        statusCode: OK_STATUS,
        data: admin as Omit<Admin, 'password'> & {
          role: Pick<Role, 'name' | 'id'> | null;
        },
      };
    } catch (error: any) {
      if (error instanceof DrizzleQueryError) {
        return this.validator.queryError(error);
      }
      return this.validator.fail(error, "Failed to get admin by id");
    }
  }

  async getCurrentAdmin(
    subjectId: string,
  ): Promise<
    TResult<
      Omit<
        Admin & { role: Omit<Role, 'id'> & { permissions: RolePermission[] } },
        'password'
      >
    >
  > {
    try {
      if (!subjectId) {
        return this.validator.notFound(ErrorCode.AUTH_UNAUTHORIZED);
      }

      return await this.getAdminByIdWithRoleAndPermissions(subjectId);
    } catch (error: any) {
      if (error instanceof DrizzleQueryError) {
        return this.validator.queryError(error);
      }
      return this.validator.fail(error, "Failed to get current admin");
    }
  }

  async createNewAdmin(
    adminData: NewAdmin,
  ): Promise<TResult<Omit<Admin, 'password'>>> {
    try {
      const email = adminData.email.toLowerCase();
      const password = hash(adminData.password);

      const transactionData = await this.db.transaction(async (tx) => {
        const [createdAdmin] = await tx
          .insert(admins)
          .values({
            ...adminData,
            password,
            email,
          })
          .returning();

        if (!createdAdmin) {
          throw new Error('Failed to create new admin');
        }

        const { password: _, ...destructedAdminResponse } = createdAdmin;

        return destructedAdminResponse;
      });

      return {
        success: true,
        statusCode: CREATED_STATUS,
        data: transactionData,
      };
    } catch (error: any) {
      console.error('Create New Admin failed');
      return this.validator.fail(error, "Failed to create new admin");
    }
  }

  async updateAdmin(
    id: string,
    adminData: UpdateAdmin,
  ): Promise<TResult<Omit<Admin, 'password'>>> {
    try {
      const { password, email, ...rest } = adminData;

      const sanitizedAdminData = Object.fromEntries(
        Object.entries({
          ...rest,
          ...(email ? { email: email.toLowerCase() } : {}),
        }).filter(([, value]) => value !== undefined),
      );

      const transactionData = await this.db.transaction(async (tx) => {
        const existingAdmin = await tx.query.admins.findFirst({
          where: eq(admins.id, id),
        });

        if (!existingAdmin) {
          throw new Error(`No Admin Found with id: ${id}`);
        }

        let updatedAdmin = existingAdmin;

        if (Object.keys(sanitizedAdminData).length > 0) {
          const [adminRecord] = await tx
            .update(admins)
            .set(sanitizedAdminData)
            .where(eq(admins.id, id))
            .returning();

          if (!adminRecord) {
            throw new Error(`No Admin Found with id: ${id}`);
          }

          updatedAdmin = adminRecord;
        }

        const { password: _, ...destructedAdmin } = updatedAdmin;

        return destructedAdmin;
      });

      return {
        success: true,
        statusCode: OK_STATUS,
        data: transactionData,
      };
    } catch (error: any) {
      console.error('Error Updating Admin');
      return this.validator.fail(error, "Failed to update admin");
    }
  }

  async changeAdminPassword(
    adminId: string,
    password: string,
  ): Promise<TResult<Omit<Admin, 'password'>>> {
    try {
      const passwordHash = hash(password);
      const [updatedAdminPassword] = await this.db
        .update(admins)
        .set({ password: passwordHash })
        .where(eq(admins.id, adminId))
        .returning();

      if (!updatedAdminPassword) {
        return this.validator.notFound(`No Admin Found with id: ${adminId}`);
      }

      const { password: _, ...destructedAdmin } = updatedAdminPassword;

      return {
        success: true,
        statusCode: OK_STATUS,
        data: destructedAdmin,
      };
    } catch (error: any) {
      console.error(error);
      return this.validator.fail(error, "Failed to change admin password");
    }
  }

  async deleteAdmin(id: string): Promise<TResult<Omit<Admin, 'password'>>> {
    try {
      const [deletedAdmin] = await this.db
        .delete(admins)
        .where(eq(admins.id, id))
        .returning();

      if (!deletedAdmin) {
        return this.validator.notFound(`No Admin Found with id: ${id}`);
      }

      //? Handle file deletion on your side...
      // if (deletedAdmin.profilePhoto) {
      //   const fileId = extractFileIdFromUrl(deletedAdmin.profilePhoto);
      //   if (fileId) {
      //     await this.fileService.deleteFile(fileId, 'admins/profiles');
      //   }
      // }

      const { password: _, ...destructedAdmin } = deletedAdmin;

      return {
        success: true,
        statusCode: OK_STATUS,
        data: destructedAdmin,
      };
    } catch (error: any) {
      console.error(error);
      return this.validator.fail(error, "Failed to delete admin");
    }
  }

  async deactivateAdmin(id: string): Promise<
    TResult<
      Omit<
        Admin & { role: Omit<Role, 'id'> & { permissions: RolePermission[] } },
        'password'
      >
    >
  > {
    try {
      const [deactivatedAdmin] = await this.db
        .update(admins)
        .set({ isActive: false })
        .where(eq(admins.id, id))
        .returning();

      if (!deactivatedAdmin) {
        return this.validator.notFound(`No Admin Found with id: ${id}`);
      }

      return await this.getAdminByIdWithRoleAndPermissions(id);
    } catch (error: any) {
      if (error instanceof DrizzleQueryError) {
        return this.validator.queryError(error);
      }
      return this.validator.fail(error, "Failed to deactivate admin");
    }
  }

  async activateAdmin(id: string): Promise<
    TResult<
      Omit<
        Admin & { role: Omit<Role, 'id'> & { permissions: RolePermission[] } },
        'password'
      >
    >
  > {
    try {
      const [activatedAdmin] = await this.db
        .update(admins)
        .set({ isActive: true })
        .where(eq(admins.id, id))
        .returning();

      if (!activatedAdmin) {
        return this.validator.notFound(`No Admin Found with id: ${id}`);
      }

      return await this.getAdminByIdWithRoleAndPermissions(id);
    } catch (error: any) {
      if (error instanceof DrizzleQueryError) {
        return this.validator.queryError(error);
      }
      return this.validator.fail(error, "Failed to activate admin");
    }
  }

  async createAdminSession(
    adminId: string,
    sessionToken: string,
    expiresAt: Date,
  ): Promise<TResult<AdminSession>> {
    try {
      const [createdSession] = await this.db
        .insert(adminSessions)
        .values({ adminId, sessionToken, expiresAt })
        .returning();

      if (!createdSession) {
        return this.validator.fail(
          `Couldn't create a session for admin with id ${adminId}`,
        );
      }

      return {
        success: true,
        statusCode: CREATED_STATUS,
        data: createdSession,
      };
    } catch (error: any) {
      return this.validator.fail(error, "Failed to create admin session");
    }
  }

  private async getAdminByIdWithRoleAndPermissions(id: string): Promise<
    TResult<
      Omit<
        Admin & { role: Omit<Role, 'id'> & { permissions: RolePermission[] } },
        'password'
      >
    >
  > {
    const adminFromDB: any = await this.db.query.admins.findFirst({
      where: eq(admins.id, id),
      columns: {
        password: false,
      },
      with: {
        role: {
          columns: {
            name: true,
          },
          with: {
            permissions: {
              columns: {
                permissions: true,
              },
            },
          },
        },
      },
    });

    if (!adminFromDB) {
      return this.validator.notFound(ErrorCode.ADMIN_NOT_FOUND);
    }

    const { role, ...rest } = adminFromDB

    return {
      success: true,
      statusCode: OK_STATUS,
      data: {
        ...rest,
        ...(rest.isActive ? {
          role: {
            name: role?.name || '',
            permissions: role?.permissions.flatMap(
              (permission: any) => permission.permissions,
            ) || [],
          }
        } : {}),
      },
    };
  }

  private async isSuperAdmin(adminId: string): Promise<boolean> {
    const admin = await this.db.query.admins.findFirst({
      where: eq(admins.id, adminId),
      with: {
        role: {
          columns: {
            name: true,
          },
        },
      },
    });
    return admin?.role?.name.toLowerCase() === 'superadmin';
  }
}
