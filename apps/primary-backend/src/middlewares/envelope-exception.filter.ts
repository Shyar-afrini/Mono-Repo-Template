// envelope-exception.filter.ts
import {
  DbErrorConfiguration,
  ErrorCode,
} from '@mono-repo-template/backend/utils';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

// Your default machine code fallback (use whatever constant you prefer)
const DEFAULT_MACHINE_CODE = ErrorCode.INTERNAL_SERVER_ERROR;
const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred';

@Catch()
export class EnvelopeExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = DEFAULT_MACHINE_CODE;
    let message: string = DEFAULT_ERROR_MESSAGE;
    let details: unknown = null;
    let source = 'internal';

    try {
      if (exception instanceof HttpException) {
        // Ensure status code is valid
        status = this.validateStatusCode(exception.getStatus());
        const body = exception.getResponse();

        // Handle string response (e.g., throw new HttpException('ERROR_CODE', 400))
        if (typeof body === 'string') {
          code = this.mapNestErrorToCode(body);
          message = body;
          source = 'application';
        }
        // Handle object response
        else if (body && typeof body === 'object') {
          const b = body as any;

          // Extract source (respect if present, fallback to 'application')
          if (typeof b.source === 'string' && b.source.trim()) {
            source = b.source.trim();
          } else {
            source = 'application';
          }

          // Extract code (prefer explicit code, fallback to mapping or name)
          if (typeof b.code === 'string' && b.code.trim()) {
            code = b.code.trim();
          } else if (typeof b.error === 'string' && b.error.trim()) {
            // NestJS built-in exceptions often have "error": "Bad Request"
            code = this.mapNestErrorToCode(b.error);
          } else {
            code = this.mapNestErrorToCode(exception.constructor.name);
          }

          // Extract message
          if (typeof b.message === 'string' && b.message.trim()) {
            message = b.message.trim();
          }
          // ValidationPipe case: message can be string[]
          else if (Array.isArray(b.message) && b.message.length > 0) {
            // Use the first validation message as the main message
            message = Array.isArray(b.message[0])
              ? b.message[0].join(', ')
              : String(b.message[0]);

            // Store all validation errors in details
            code = ErrorCode.VALIDATION_ERROR;
            details = {
              validation: b.message,
              field: b.field ?? null,
            };
            source = 'validation';
          }
          // If no message found, use code as message
          else {
            message = code;
          }

          // Extract explicit details if present and not already set by validation logic
          if (b.details !== undefined && b.details !== null && !details) {
            details = b.details;
          }
        }

        // If still no details, look at HttpException options.cause
        const cause = (exception as any).cause ?? null;
        if (!details && cause) {
          details =
            cause instanceof Error
              ? {
                name: cause.name,
                message: cause.message,
                ...(process.env.NODE_ENV !== 'production' && {
                  stack: cause.stack,
                }),
              }
              : cause;
        }
      }
      // Handle non-HTTP exceptions (like Database errors)
      else if (
        exception &&
        typeof exception === 'object' &&
        'code' in exception
      ) {
        const dbError = exception as any;
        source = 'database';
        status = HttpStatus.BAD_REQUEST; // Usually DB errors are client-side fault (duplicate, FK)

        // Try to find a mapped error
        const pgCode = dbError.code;
        const constraint = dbError.constraint || dbError.table; // Fallback to table if constraint missing

        let mappedError = null;

        if (pgCode && DbErrorConfiguration[pgCode]) {
          // Check for specific constraint mapping
          if (constraint && DbErrorConfiguration[pgCode][constraint]) {
            mappedError = DbErrorConfiguration[pgCode][constraint];
          }
        }

        if (mappedError) {
          code = mappedError.code;
          message = mappedError.message || dbError.message;
          status = HttpStatus.CONFLICT; // 409 for conflicts/duplicates
        } else {
          // Fallback for unmapped DB errors
          switch (dbError.code) {
            case '23505': // unique_violation
              code = 'DUPLICATE_ENTRY';
              message = 'A record with this value already exists';
              status = HttpStatus.CONFLICT;
              break;
            case '23503': // foreign_key_violation
              code = 'FOREIGN_KEY_VIOLATION';
              message =
                'This operation cannot be completed due to related records';
              status = HttpStatus.CONFLICT;
              break;
            case '23502': // not_null_violation
              code = 'NOT_NULL_VIOLATION';
              message = 'A required field is missing';
              status = HttpStatus.BAD_REQUEST;
              break;
            default:
              code = ErrorCode.DATABASE_ERROR;
              message = dbError.message || DEFAULT_ERROR_MESSAGE;
              status = HttpStatus.INTERNAL_SERVER_ERROR;
          }
        }

        if (process.env.NODE_ENV !== 'production') {
          details = {
            dbCode: dbError.code,
            dbMessage: dbError.message,
            detail: dbError.detail,
            table: dbError.table,
            constraint: dbError.constraint,
          };
        } else {
          // Limit details in production but keep hint for debugging if safe
          details = {
            table: dbError.table,
          };
        }
      } else if (exception instanceof Error) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        code = DEFAULT_MACHINE_CODE;
        source = 'internal';
        message =
          process.env.NODE_ENV === 'production'
            ? DEFAULT_ERROR_MESSAGE
            : exception.message || DEFAULT_ERROR_MESSAGE;

        // Only include stack trace in non-production environments
        details = {
          name: exception.name,
          ...(process.env.NODE_ENV !== 'production' && {
            message: exception.message,
            stack: exception.stack,
          }),
        };
      }
      // Handle unknown exceptions
      else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        code = DEFAULT_MACHINE_CODE;
        message = DEFAULT_ERROR_MESSAGE;
        source = 'unknown';

        if (process.env.NODE_ENV !== 'production') {
          details = {
            raw: String(exception),
            type: typeof exception,
          };
        }
      }
    } catch (processingError) {
      // Fallback if exception processing itself fails
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = DEFAULT_MACHINE_CODE;
      message = DEFAULT_ERROR_MESSAGE;

      if (process.env.NODE_ENV !== 'production') {
        details = {
          processingError:
            processingError instanceof Error
              ? processingError.message
              : 'Failed to process exception',
          originalException: String(exception),
        };
      }
    }

    // Ensure we have valid values before sending response
    const response = {
      success: false,
      statusCode: this.validateStatusCode(status),
      error: {
        source,
        code: code || DEFAULT_MACHINE_CODE,
        message: message || DEFAULT_ERROR_MESSAGE,
        ...(details !== null && details !== undefined && { details }),
      },
    };

    // Ensure response hasn't been sent already
    if (!res.headersSent) {
      res.status(response.statusCode).json(response);
    }
  }

  /**
   * Maps standard NestJS error names/messages to structured ErrorCode constants
   */
  private mapNestErrorToCode(error: string): string {
    const errorUpper = error.toUpperCase().replace(/\s+/g, '_');

    // Handle standard NestJS Exception names and "error" field values
    const mapping: Record<string, string> = {
      BAD_REQUEST: ErrorCode.VALIDATION_ERROR,
      BADREQUESTEXCEPTION: ErrorCode.VALIDATION_ERROR,
      UNAUTHORIZED: ErrorCode.AUTH_UNAUTHORIZED,
      UNAUTHORIZEDEXCEPTION: ErrorCode.AUTH_UNAUTHORIZED,
      FORBIDDEN: ErrorCode.AUTH_FORBIDDEN,
      FORBIDDENEXCEPTION: ErrorCode.AUTH_FORBIDDEN,
      NOT_FOUND: ErrorCode.NOT_FOUND_ERROR,
      NOTFOUNDEXCEPTION: ErrorCode.NOT_FOUND_ERROR,
      METHOD_NOT_ALLOWED: 'METHOD_NOT_ALLOWED',
      CONFLICT: 'CONFLICT_ERROR',
      CONFLICTEXCEPTION: 'CONFLICT_ERROR',
      TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
      PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
      UNSUPPORTED_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE',
      INTERNAL_SERVER_ERROR: ErrorCode.INTERNAL_SERVER_ERROR,
      INTERNALSERVERERROREXCEPTION: ErrorCode.INTERNAL_SERVER_ERROR,
      USER_NOT_FOUND: ErrorCode.USER_NOT_FOUND,
      CONTRACT_NOT_FOUND: ErrorCode.CONTRACT_NOT_FOUND,
      INVOICE_NOT_FOUND: ErrorCode.INVOICE_NOT_FOUND,
      BUILDING_NOT_FOUND: ErrorCode.BUILDING_NOT_FOUND,
      UNIT_NOT_FOUND: ErrorCode.UNIT_NOT_FOUND,
      VEHICLE_NOT_FOUND: ErrorCode.VEHICLE_NOT_FOUND,
    };

    return mapping[errorUpper] || errorUpper || DEFAULT_MACHINE_CODE;
  }

  /**
   * Validates and normalizes HTTP status codes
   * Ensures the status code is a valid HTTP status code
   */
  private validateStatusCode(status: number): number {
    // Check if status is a valid number and within HTTP status code range
    if (!Number.isInteger(status) || status < 100 || status > 599) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
    return status;
  }
}
