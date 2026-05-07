import type { AuditLog } from "@mono-repo-template/database";

/**
 * Audit Log Action Type
 * Actions that can be performed on entities
 */
export const AuditLogActionValues = ["CREATE", "DELETE", "UPDATE"] as const;
export type AuditLogAction = (typeof AuditLogActionValues)[number];

/**
 * Audit Log Entity Type
 * Entity types that can be audited
 */
export const AuditLogEntityValues = [
  "TICKET",
  "CONTRACT",
  "VEHICLE",
  "USER",
  "ADMIN",
  "BUSINESS",
  "PAYMENT",
  "INVOICE",
  "CAMERA",
  "GATE",
  "SECTOR",
  "BUILDING",
  "BLOCK",
  "UNIT",
  "FLOOR",
  "ADDRESS",
  "DOCUMENT",
  "NOTIFICATION",
  "SERVICE",
  "PREFERENCE",
  "PERMISSION",
  "FILE",
] as const;
export type AuditLogEntity = (typeof AuditLogEntityValues)[number];

/**
 * Audit Log User (partial user fields from API response)
 * User information associated with an audit log entry
 */
export interface AuditLogUser {
  id: string;
  fullname?: string;
  email?: string;
  phoneNumber?: string;
  profilePhoto?: string | null;
}

/**
 * Audit Log With Relations
 * Extends AuditLog from database with user relation if available
 */
export interface AuditLogWithRelations extends AuditLog {
  /**
   * User information (can be null)
   */
  user: AuditLogUser | null;

  /**
   * Mobile user ID (can be null, used when userId is null)
   */
  mobileUserId: string | null;
}

/**
 * Audit Log Date Range
 * Date range filter for audit logs
 */
export interface AuditLogDateRange {
  /**
   * Start date in ISO format: 2025-01-01T00:00:00.000Z
   */
  startDate?: string;

  /**
   * End date in ISO format: 2025-01-01T00:00:00.000Z
   */
  endDate?: string;
}

/**
 * Get Audit Logs Query Parameters
 * Parameters for filtering, searching, and paginating audit logs
 */
export interface GetAuditLogsParams {
  /**
   * Page number (1-indexed)
   * Default: 1
   */
  page?: number;

  /**
   * Items per page
   * Default: 200
   */
  limit?: number;

  /**
   * Filter by user ID
   * Only return audit logs for the specified user
   */
  userId?: string;

  /**
   * Filter by action type
   * Only return audit logs with the specified action
   */
  action?: AuditLogAction;

  /**
   * Filter by entity type
   * Only return audit logs for the specified entity type
   */
  entity?: AuditLogEntity;

  /**
   * Start date filter (ISO format: 2025-01-01T00:00:00.000Z)
   * Only return audit logs on or after this date
   */
  startDate?: string;

  /**
   * End date filter (ISO format: 2025-01-01T00:00:00.000Z)
   * Only return audit logs on or before this date
   */
  endDate?: string;
}

/**
 * Audit Logs Response Meta
 * Pagination metadata returned by the API
 */
export interface AuditLogsResponseMeta {
  /**
   * Total count of audit logs matching the query
   */
  totalCount: number;

  /**
   * Whether there are more pages available
   */
  hasMorePages: boolean;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Current page number
   */
  currentPage: number;
}

/**
 * Audit Logs Response
 * API response structure for paginated audit log lists
 */
export interface AuditLogsResponse {
  /**
   * Array of audit logs with relations
   */
  data: AuditLogWithRelations[];

  /**
   * Pagination metadata
   */
  meta: AuditLogsResponseMeta;
}
