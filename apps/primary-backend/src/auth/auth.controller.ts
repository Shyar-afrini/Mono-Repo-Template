import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpException,
  Post,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  clearJwtCookies,
  getSharedDomain,
  JWT_EXPIRE,
  ms,
  NO_CONTENT_STATUS,
  OK_STATUS,
  SESSION_TOKEN,
  setJwtCookie,
  verifyJWT,
} from '@mono-repo-template/backend/utils';
import {
  Admin,
  AdminSession,
  type AuthInput,
  AuthInputSchema,
} from '@mono-repo-template/database';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { ZodValidationPipe } from 'nestjs-zod';
import { AnyClaims } from 'node_modules/@mono-repo-template/backend/dist/utils/jwt';
import { AuthGuard } from 'src/middlewares/check-auth.middleware';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signin')
  @HttpCode(OK_STATUS)
  async signin(
    @Body(new ZodValidationPipe(AuthInputSchema)) body: AuthInput,
    @Res({ passthrough: true }) res: ExpressResponse,
    @Request() req: ExpressRequest,
  ): Promise<
    Pick<Admin, 'id' | 'fullname' | 'email' | 'isActive' | 'profilePhoto'>
  > {
    const result = await this.authService.signin(body);
    if (!result.success || typeof result.data?.session !== 'string') {
      throw new HttpException(
        { message: result.error?.message, code: result.error?.code },
        result.statusCode,
        {
          cause: result.error?.details,
        },
      );
    }

    // set httpOnly cookie and also return body
    setJwtCookie(
      res,
      result.data.session,
      ms(JWT_EXPIRE),
      SESSION_TOKEN,
      getSharedDomain(req),
    );
    return result.data.admin;
  }

  @Post('signout')
  @HttpCode(NO_CONTENT_STATUS) // 204
  async signout(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const token = req.cookies[SESSION_TOKEN];

    await this.authService.revokeAdminSession(token);
    clearJwtCookies(res, { domain: getSharedDomain(req) });
    return;
  }

  @Post('session')
  @HttpCode(OK_STATUS)
  @UseGuards(AuthGuard)
  async createSession(
    @Request() request: ExpressRequest,
  ): Promise<AdminSession> {
    const token = request.cookies[SESSION_TOKEN];
    const jwt = verifyJWT(token ?? '');
    if (!token || !jwt) {
      throw new UnauthorizedException('Not Logged In');
    }

    // exp in seconds -> Date
    const ttlMs = ms(JWT_EXPIRE);
    const expiresAt = new Date(Date.now() + ttlMs);

    const result = await this.authService.createAdminSession(
      jwt.sub,
      token,
      expiresAt,
    );
    if (!result.success || !result.data?.sessionToken) {
      throw new BadRequestException(result.error?.message);
    }
    return result.data;
  }

  @Post('session/validate')
  @HttpCode(200)
  async validateSession(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const domain = getSharedDomain(req);
    const throwDeny = (message = 'Unauthorized', clear = true): never => {
      if (clear) clearJwtCookies(res, { domain });
      throw new UnauthorizedException({ message, details: null });
    };

    const token = req.cookies?.[SESSION_TOKEN];
    if (!token) throwDeny('Not Logged In');

    const payload: AnyClaims = (() => {
      try {
        return verifyJWT(token) as AnyClaims;
      } catch {
        return throwDeny('Invalid token'); // never
      }
    })();

    const nowSec = Math.floor(Date.now() / 1000);
    const leewaySec = 60;
    if (!payload.exp || payload.exp + leewaySec < nowSec) {
      throwDeny('Session expired');
    }

    const { success, data: session } =
      await this.authService.checkSessionFromDB(token);
    if (!success || !session) throwDeny('Invalid session');
    if (payload.sub && session?.adminId && payload.sub !== session.adminId) {
      throwDeny('Invalid session');
    }

    const dbExpiresMs =
      session?.expiresAt instanceof Date
        ? session.expiresAt.getTime()
        : new Date(session?.expiresAt as any).getTime();
    if (dbExpiresMs + leewaySec * 1000 < Date.now())
      throwDeny('Session expired');

    return {
      expiresAt: dbExpiresMs,
      message: `Session Expires At: ${new Date(dbExpiresMs).toLocaleString()}`,
    };
  }
}
