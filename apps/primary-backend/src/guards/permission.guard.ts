import { SESSION_TOKEN, verifyJWT } from '@mono-repo-template/backend/utils';
import type { PrimaryDb } from '@mono-repo-template/database';
import {
  DRIZZLE_PRIMARY_DB,
  sql,
} from '@mono-repo-template/database';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(DRIZZLE_PRIMARY_DB) private db: PrimaryDb,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // No permission required
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.cookies[SESSION_TOKEN];

    if (!authHeader) {
      throw new ForbiddenException('No valid authentication token provided');
    }

    try {
      const token = authHeader;
      const decoded = verifyJWT(token);

      if (!decoded || !decoded.sub) {
        throw new ForbiddenException('Invalid authentication token');
      }

      // For Admin Users: Check if the user has ALL required permissions
      for (const permission of requiredPermissions) {
        const hasPermission = await this.checkUserPermission(
          decoded.sub,
          permission,
        );

        if (!hasPermission) {
          throw new ForbiddenException(
            `Insufficient permissions. Missing: ${permission}`,
          );
        }
      }

      return true;
    } catch (error: any) {
      console.log('❌ Permission check error:', error);
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Permission check failed');
    }
  }

  private async checkUserPermission(
    userId: string,
    requiredPermission: string,
  ): Promise<boolean> {
    try {
      // Use a single query to set context and check permission in the same session
      const result = await this.db.execute(sql`
        SELECT 
          set_config('app.user_id', ${userId}, true) as context_set,
          public.check_permission(${requiredPermission}::"permission") as has_permission
      `);

      // Try different ways to access the result
      let hasPermission = false;
      const rows = (result as any).rows || result;

      if (rows && Array.isArray(rows) && rows.length > 0) {
        hasPermission = rows[0]?.has_permission === true;
      }

      return hasPermission;
    } catch (error: any) {
      console.error('❌ Permission check error:', error);
      return false;
    }
  }
}
