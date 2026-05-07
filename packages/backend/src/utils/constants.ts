import ms from "ms";

// General Server Errors
export const INTERNAL_SERVER_CODE = "INTERNAL_SERVER_ERROR";
export const INTERNAL_SERVER_STATUS = 500;

// Not Found
export const NOT_FOUND_CODE = "NOT_FOUND_ERROR";
export const NOT_FOUND_STATUS = 404;
export const TRANSACTION_NOT_FOUND_CODE = "TRANSACTION_NOT_FOUND";
export const WALLET_NOT_FOUND_CODE = "WALLET_NOT_FOUND";

// Unauthorized
export const UNAUTHORIZED_CODE = "UNAUTHORIZED_ERR";
export const UNAUTHORIZED_STATUS = 401;

// Forbidden
export const FORBIDDEN_CODE = "FORBIDDEN_ERR";
export const FORBIDDEN_STATUS = 403;

// Bad Request
export const BAD_REQUEST_CODE = "BAD_REQUEST_ERR";
export const BAD_REQUEST_STATUS = 400;

export const BAD_REQUEST_ID_CODE = "INVALID_ID_FORMAT";
export const BAD_REQUEST_BODY_CODE = "INVALID_REQUEST_DATA_FORMAT";
export const BAD_REQUEST_DELETE_CODE = "CANNOT_DELETE_DEPENDENCY_EXISTS";

// Conflict
export const CONFLICT_CODE = "CONFLICT_ERR";
export const CONFLICT_STATUS = 409;

// Created
export const CREATED_SUCCESS_CODE = "CREATED_SUCCESS";
export const CREATED_STATUS = 201;

// OK
export const OK_SUCCESS_CODE = "OK_SUCCESS";
export const OK_STATUS = 200;

// No Content
export const NO_CONTENT_SUCCESS_CODE = "NO_CONTENT_SUCCESS";
export const NO_CONTENT_STATUS = 204;

// Token Errors
export const NO_TOKEN_CODE = "NO_TOKEN_PROVIDED";
export const NO_TOKEN_STATUS = 401;

export const INVALID_TOKEN_CODE = "INVALID_OR_EXPIRED_TOKEN";
export const INVALID_TOKEN_STATUS = 401;

// Rate Limiter
export const RATE_LIMIT_STATUS = 429;
export const RATE_LIMIT_CODE = "TOO_MANY_REQUESTS";
export const RATE_LIMIT = 5000; // Tries
export const RATE_LIMIT_TIME_WINDOW = 10; // Minutes

// JWT
export const JWT_EXPIRE = "30d";
export const JWT_EXPIRE_ACCESS_TOKEN = "30m";

// Pagination
export const LIMIT_CONSTANT = 20;

export { ms };

export const ACCESS_TOKEN = "access_token";
export const SESSION_TOKEN = "session_token";

export const INVALID_TOKEN_MESSAGE = "Invalid token";
export const EXPIRED_TOKEN_STATUS = 401;
export const EXPIRED_TOKEN_CODE = "EXPIRED_TOKEN";
