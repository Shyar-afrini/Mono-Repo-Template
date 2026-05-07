import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LimiterMiddleware extends ThrottlerGuard {
  protected message = 'Too many requests try again in a minute';
  protected errorMessage: string = 'Too many requests try again in a minute';

  // Skip rate limiting for OPTIONS preflight requests.
  // Browsers send OPTIONS before every cross-origin request (CORS preflight).
  // Throttling them strips CORS headers from the error response, causing CORS errors.
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.method === 'OPTIONS') {
      return true;
    }
    return super.shouldSkip(context);
  }
}
