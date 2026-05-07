// auth.guard.ts
import { SESSION_TOKEN, verifyJWT } from '@mono-repo-template/backend/utils';
import {
  AdminSession,
  adminSessions,
  primaryDb,
} from '@mono-repo-template/database';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.cookies?.[SESSION_TOKEN];
    const decodedToken = verifyJWT(token);

    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    if (!token) {
      // Log that we didn’t receive the cookie
      console.warn('[Primary][AuthGuard] Missing cookie', SESSION_TOKEN);
      throw new UnauthorizedException({
        message: 'Missing session token',
        details: { cookie: SESSION_TOKEN },
      });
    }

    console.log('User session: ', token);

    try {
      const [session]: AdminSession[] = await primaryDb
        .select()
        .from(adminSessions)
        .where(eq(adminSessions.sessionToken, token))


      if (!session) {
        throw new UnauthorizedException({
          message: 'Invalid or expired session Session',
          // don’t include raw token in details; keep it safe
          details:
            'You might of signed in from another device, if not please reset your password',
        });
      }

      req.session = session;
      return true;
    } catch (err) {
      // Database or unexpected error
      throw new InternalServerErrorException({
        message: 'Authentication check failed',
        details: err instanceof Error ? err.message : err,
      });
    }
  }
}
