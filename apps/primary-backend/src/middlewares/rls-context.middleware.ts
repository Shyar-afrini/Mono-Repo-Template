import { SESSION_TOKEN, verifyJWT } from '@mono-repo-template/backend/utils';
import { primaryDb } from '@mono-repo-template/database';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AdminClaims } from 'node_modules/@mono-repo-template/backend/dist/utils/jwt';

@Injectable()
export class RLSContextMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.cookies[SESSION_TOKEN];

      if (authHeader) {
        const token = authHeader;
        const decoded: AdminClaims | null =
          verifyJWT(token);

        if (decoded && decoded.sub) {
          // Set the user ID in the database session for RLS
          await primaryDb?.execute(
            `SELECT set_config('app.user_id', '${decoded.sub}', true)`,
          );
        }
      }
    } catch (error: any) {
      // If JWT verification fails, continue without setting user context
      // RLS policies will handle the access control
      console.warn(
        'Failed to set RLS context:',
        error instanceof Error ? error.message : error,
      );
    }

    next();
  }
}
