import { Inject, Injectable } from '@nestjs/common';
import { TResult } from '@mono-repo-template/backend/types';
import {
  CREATED_STATUS,
  createJWT,
  JWT_EXPIRE,
  ms,
  OK_STATUS,
  verifyHash,
  ErrorCode,
} from '@mono-repo-template/backend/utils';
import {
  Admin,
  admins,
  AdminSession,
  adminSessions,
  AuthInput,
  DRIZZLE_PRIMARY_DB,
  DrizzleQueryError,
  eq,
  type PrimaryDb,
} from '@mono-repo-template/database';
import { Validator } from 'database/validator';

type SigninData = {
  admin: Pick<Admin, 'id' | 'fullname' | 'email' | 'isActive' | 'profilePhoto'>;
  session: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly validator: Validator,
    @Inject(DRIZZLE_PRIMARY_DB) private readonly db: PrimaryDb,
  ) { }

  async signin(payload: AuthInput): Promise<TResult<SigninData>> {
    try {
      // Validate TTL up-front to avoid NaN Date
      const ttlMs = ms(JWT_EXPIRE);
      if (typeof ttlMs !== 'number' || !Number.isFinite(ttlMs) || ttlMs <= 0) {
        return this.validator.badRequest(ErrorCode.VALIDATION_ERROR);
      }

      const payloadEmail = payload.email.toLowerCase();

      const result = await this.db.transaction<TResult<SigninData>>(
        async (tx) => {
          // 1) Load only what we need; keep types minimal
          const admin = await tx.query.admins.findFirst({
            where: eq(admins.email, payloadEmail),
            columns: {
              id: true,
              fullname: true,
              email: true,
              isActive: true,
              profilePhoto: true,
              password: true,
            } as const,
          });

          if (!admin) {
            return this.validator.badRequest(
              `Admin with email ${payloadEmail} not found`,
            );
          }

          if (!verifyHash(payload.password, admin.password)) {
            return this.validator.badRequest(
              'Wrong credentials, please try again.',
            );
          }

          if (!admin.isActive) {
            return this.validator.badRequest(
              'Admin is not active, please contact support.',
            );
          }

          // 2) Ensure we have at most one active session (do it in the same tx if possible)
          const existingSession = await tx.query.adminSessions.findFirst({
            where: eq(adminSessions.adminId, admin.id),
            columns: { sessionToken: true } as const,
          });

          if (existingSession?.sessionToken) {
            // If your revoke method can accept a tx, prefer that for atomicity:
            // await this.revokeAdminSession(existingSession.sessionToken, tx);
            await this.revokeAdminSession(existingSession.sessionToken);
          }

          // 3) Create JWT + session
          const jwt = createJWT('admin', admin.id, {
            fullname: admin.fullname,
            isActive: admin.isActive,
            email: admin.email,
          });

          const sessionExpireAt = new Date(Date.now() + ttlMs);

          const session = await this.createAdminSession(
            admin.id,
            jwt,
            sessionExpireAt /*, tx */,
          );
          if (!session.success) {
            return this.validator.badRequest(
              `Couldn't create a session for admin with id ${admin.id} ${session.error?.message ?? ''}`,
            );
          }

          await this.updateAdminLastLoginAt(admin.id /*, tx */);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { password: _, ...rest } = admin;
          const adminSafe: SigninData['admin'] = {
            id: rest.id,
            fullname: rest.fullname,
            email: rest.email,
            isActive: rest.isActive,
            profilePhoto: rest.profilePhoto,
          };

          return {
            success: true,
            statusCode: OK_STATUS,
            data: {
              admin: adminSafe,
              session: jwt,
            },
          };
        },
      );

      return result;
    } catch (error: any) {
      return this.validator.fail(error, "Failed to signin");
    }
  }

  async updateAdminLastLoginAt(adminId: string): Promise<TResult<void>> {
    try {
      const [updatedAdmin] = await this.db
        .update(admins)
        .set({ lastLoginAt: new Date() })
        .where(eq(admins.id, adminId))
        .returning({ id: admins.id });

      if (!updatedAdmin) {
        return this.validator.notFound(`No Admin Found with id: ${adminId}`);
      }

      return {
        success: true,
        statusCode: OK_STATUS,
      };
    } catch (error: any) {
      return this.validator.fail(error, "Failed to update admin last login at");
    }
  }

  async createAdminSession(
    adminId: string,
    sessionToken: string,
    expiresAt: Date,
  ): Promise<TResult<AdminSession>> {
    try {
      const [createdAdminSession] = await this.db
        .insert(adminSessions)
        .values({
          adminId,
          sessionToken,
          expiresAt,
        })
        .returning();

      if (!createdAdminSession) {
        return this.validator.badRequest(ErrorCode.AUTH_UNAUTHORIZED);
      }

      return {
        success: true,
        statusCode: CREATED_STATUS,
        data: createdAdminSession,
      };
    } catch (error: any) {
      return this.validator.fail(error, "Failed to create admin session");
    }
  }

  async checkSessionFromDB(
    sessionToken: string,
  ): Promise<TResult<AdminSession>> {
    try {
      const session = await this.db.query.adminSessions.findFirst({
        where: eq(adminSessions.sessionToken, sessionToken),
      });

      return {
        success: true,
        statusCode: OK_STATUS,
        data: session,
      };
    } catch (error: any) {
      if (error instanceof DrizzleQueryError) {
        return this.validator.queryError(error);
      }
      return this.validator.fail(error, "Failed to check session from d b");
    }
  }

  async revokeAdminSession(sessionToken: string): Promise<TResult<void>> {
    try {
      await this.db
        .delete(adminSessions)
        .where(eq(adminSessions.sessionToken, sessionToken));

      return {
        success: true,
        statusCode: OK_STATUS,
      };
    } catch (error: any) {
      return this.validator.fail(error, "Failed to revoke admin session");
    }
  }
}
