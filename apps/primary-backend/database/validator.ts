import { TResult } from '@mono-repo-template/backend/types';
import {
  BAD_REQUEST_CODE,
  BAD_REQUEST_STATUS,
  DbErrorConfiguration,
  ErrorCode,
  INTERNAL_SERVER_CODE,
  INTERNAL_SERVER_STATUS,
  NOT_FOUND_CODE,
  NOT_FOUND_STATUS,
  OK_STATUS,
} from '@mono-repo-template/backend/utils';
import {
  AuthInput,
  AuthInputSchema,
} from '@mono-repo-template/database';
import { Injectable } from '@nestjs/common';
import { getReasonPhrase } from 'http-status-codes';
import { ZodSchema } from 'zod';

@Injectable()
export class Validator {
  private parse<T>(schema: ZodSchema<T>, data: unknown): TResult<T> {
    const result = schema.safeParse(data);
    if (!result.success) {
      return {
        statusCode: BAD_REQUEST_STATUS,
        success: false,
        error: {
          source: 'validation',
          code: BAD_REQUEST_CODE,
          message: getReasonPhrase(BAD_REQUEST_STATUS),
          details: result.error.flatten(),
        },
      };
    }
    return { success: true, statusCode: OK_STATUS, data: result.data };
  }

  validateLogin(payload: unknown): TResult<AuthInput> {
    return this.parse<AuthInput>(AuthInputSchema, payload);
  }

  // Helper to convert thrown errors into TResult
  fail(codeOrError?: Error | string, message?: string): TResult<never> {
    console.error('Validation/Internal error:', codeOrError);
    let code = INTERNAL_SERVER_CODE;
    let details = codeOrError instanceof Error ? codeOrError.message : codeOrError;

    if (typeof codeOrError === 'string') {
      code = codeOrError;
      details = message;
    }

    return {
      success: false,
      statusCode: INTERNAL_SERVER_STATUS,
      error: {
        source: 'internal',
        code,
        message: message || code, // Use message if provided, else code
        details,
      },
    };
  }

  badRequest(codeOrError?: Error | string, message?: string): TResult<never> {
    console.error('Bad Request error:', codeOrError);
    let code = BAD_REQUEST_CODE;
    let details = codeOrError instanceof Error ? codeOrError.message : codeOrError;

    if (typeof codeOrError === 'string') {
      code = codeOrError;
      details = message;
    }

    return {
      success: false,
      statusCode: BAD_REQUEST_STATUS,
      error: {
        source: 'application',
        code,
        message: message || code,
        details,
      },
    };
  }

  queryError(error?: any): TResult<never> {
    console.error('Query error: ', error);

    let code = 'DATABASE_ERROR';
    let message = getReasonPhrase(BAD_REQUEST_STATUS);
    let details = error;

    // If it's a database error with a code (e.g., PostgreSQL error)
    let dbError: any = error;
    let pgCode: string | undefined = undefined;

    // Robust search for the original database error code
    let current = error;
    while (current && typeof current === 'object') {
      if ('code' in current && typeof current.code === 'string' && /^\d{5}$/.test(current.code)) {
        pgCode = current.code;
        dbError = current;
        break;
      }
      current = current.cause || (current.originalError); // Some drivers use originalError
    }

    if (pgCode) {
      const constraint = dbError.constraint || dbError.table;

      let mappedError = null;
      if (DbErrorConfiguration[pgCode]) {
        if (constraint && DbErrorConfiguration[pgCode][constraint]) {
          mappedError = DbErrorConfiguration[pgCode][constraint];
        }
      }

      if (mappedError) {
        code = mappedError.code;
        message = mappedError.message || dbError.message;
      } else {
        // Broad fallbacks for unmapped DB errors
        switch (pgCode) {
          case '23505':
            code = ErrorCode.DUPLICATE_ENTRY;
            message = 'A record with this value already exists';
            break;
          case '23503':
            code = ErrorCode.FOREIGN_KEY_VIOLATION;
            message = 'This operation cannot be completed due to related records';
            break;
          default:
            code = ErrorCode.DATABASE_ERROR;
            message = dbError.message || getReasonPhrase(BAD_REQUEST_STATUS);
        }
      }

      // In production, mask detailed DB messages but keep the code
      if (process.env.NODE_ENV === 'production') {
        details = { table: dbError.table };
      } else {
        details = {
          dbCode: pgCode,
          dbMessage: dbError.message,
          detail: dbError.detail,
          table: dbError.table,
          constraint: dbError.constraint,
        };
      }
    }

    return {
      success: false,
      statusCode: BAD_REQUEST_STATUS,
      error: {
        source: 'database',
        code,
        message,
        details,
      },
    };
  }

  notFound(error?: Error | string, message?: string): TResult<never> {
    return {
      success: false,
      statusCode: NOT_FOUND_STATUS,
      error: { source: 'application', code: error instanceof Error ? error.message : error || NOT_FOUND_CODE, message: message || (error instanceof Error ? error.message : error) || NOT_FOUND_CODE },
    };
  }
}
