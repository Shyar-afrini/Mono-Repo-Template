// envelope.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { NO_CONTENT_STATUS, OK_STATUS } from '@mono-repo-template/backend/utils';
import { Observable, map } from 'rxjs';

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode:
          data && (data.length > 0 || Object.keys(data).length > 0)
            ? OK_STATUS
            : NO_CONTENT_STATUS,
        data,
      })),
    );
  }
}
