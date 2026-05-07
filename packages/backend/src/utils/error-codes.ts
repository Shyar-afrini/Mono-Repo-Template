/**
 * Structured Error Codes for the Urban Management System.
 * Following the format: <DOMAIN>_<PROBLEM> or <DOMAIN>_<RESOURCE>_<PROBLEM>
 */
export const ErrorCode = {
    // --- AUTH & PERMISSIONS ---
    AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
    AUTH_FORBIDDEN: 'AUTH_FORBIDDEN',
    USER_ROLE_NOT_ALLOWED: 'USER_ROLE_NOT_ALLOWED',
    AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
    AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',

    // --- VALIDATION ---
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
    VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
    VALIDATION_OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',

    // --- SECTORS ---
    SECTOR_NOT_FOUND: 'SECTOR_NOT_FOUND',
    SECTOR_DUPLICATE_NAME: 'SECTOR_DUPLICATE_NAME',
    SECTOR_HAS_ACTIVE_BUILDINGS: 'SECTOR_HAS_ACTIVE_BUILDINGS',
    SECTOR_HAS_ACTIVE_UNITS: 'SECTOR_HAS_ACTIVE_UNITS',

    // --- BUILDINGS ---
    BUILDING_NOT_FOUND: 'BUILDING_NOT_FOUND',
    BUILDING_DUPLICATE_CODE: 'BUILDING_DUPLICATE_CODE',
    BUILDING_DUPLICATE_NAME: 'BUILDING_DUPLICATE_NAME',
    BUILDING_HAS_ACTIVE_UNITS: 'BUILDING_HAS_ACTIVE_UNITS',
    BUILDING_HAS_ACTIVE_FLOORS: 'BUILDING_HAS_ACTIVE_FLOORS',
    BUILDING_HAS_ACTIVE_BLOCKS: 'BUILDING_HAS_ACTIVE_BLOCKS',

    // --- FLOORS & BLOCKS ---
    FLOOR_NOT_FOUND: 'FLOOR_NOT_FOUND',
    BLOCK_NOT_FOUND: 'BLOCK_NOT_FOUND',
    BLOCK_HAS_ACTIVE_UNITS: 'BLOCK_HAS_ACTIVE_UNITS',
    FLOOR_HAS_ACTIVE_UNITS: 'FLOOR_HAS_ACTIVE_UNITS',

    // --- UNITS ---
    UNIT_NOT_FOUND: 'UNIT_NOT_FOUND',
    UNIT_DUPLICATE_NUMBER: 'UNIT_DUPLICATE_NUMBER',
    UNIT_OCCUPIED: 'UNIT_OCCUPIED',
    UNIT_ALREADY_OWNED: 'UNIT_ALREADY_OWNED',
    UNIT_TEMPLATE_NOT_FOUND: 'UNIT_TEMPLATE_NOT_FOUND',
    UNIT_HAS_ACTIVE_CONTRACTS: 'UNIT_HAS_ACTIVE_CONTRACTS',
    UNIT_ALREADY_SUBSCRIBED: 'UNIT_ALREADY_SUBSCRIBED',

    // --- USERS ---
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    USER_EMAIL_ALREADY_EXISTS: 'USER_EMAIL_ALREADY_EXISTS',
    USER_PHONE_ALREADY_EXISTS: 'USER_PHONE_ALREADY_EXISTS',
    USER_IS_DEACTIVATED: 'USER_IS_DEACTIVATED',
    ADMIN_NOT_FOUND: 'ADMIN_NOT_FOUND',
    USER_PREFERENCES_NOT_FOUND: 'USER_PREFERENCES_NOT_FOUND',
    USER_HAS_ACTIVE_CONTRACTS: 'USER_HAS_ACTIVE_CONTRACTS',
    USER_HAS_ACTIVE_VEHICLES: 'USER_HAS_ACTIVE_VEHICLES',

    // --- DOCUMENTS ---
    DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
    DOCUMENT_DUPLICATE_REFERENCE: 'DOCUMENT_DUPLICATE_REFERENCE',

    // --- CONTRACTS ---
    CONTRACT_NOT_FOUND: 'CONTRACT_NOT_FOUND',
    CONTRACT_ALREADY_ACTIVE: 'CONTRACT_ALREADY_ACTIVE',
    CONTRACT_DUPLICATE: 'CONTRACT_DUPLICATE',
    CONTRACT_UNIT_ALREADY_ACTIVE: 'CONTRACT_UNIT_ALREADY_ACTIVE',
    CONTRACT_HAS_ACTIVE_INVOICES: 'CONTRACT_HAS_ACTIVE_INVOICES',
    CONTRACT_ALREADY_TERMINATED: 'CONTRACT_ALREADY_TERMINATED',
    CONTRACT_NOT_ACTIVE: 'CONTRACT_NOT_ACTIVE',

    // --- INVOICES ---
    INVOICE_NOT_FOUND: 'INVOICE_NOT_FOUND',
    INVOICE_ALREADY_PAID: 'INVOICE_ALREADY_PAID',
    INVOICE_CANCELLED: 'INVOICE_CANCELLED',
    INVOICE_HAS_ACTIVE_PAYMENTS: 'INVOICE_HAS_ACTIVE_PAYMENTS',

    // --- PAYMENTS ---
    PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
    PAYMENT_AMOUNT_EXCEEDS_BALANCE: 'PAYMENT_AMOUNT_EXCEEDS_BALANCE',
    PAYMENT_FAILED: 'PAYMENT_FAILED',

    // --- TICKETS ---
    TICKET_NOT_FOUND: 'TICKET_NOT_FOUND',

    // --- CAMERAS & GATES ---
    CAMERA_NOT_FOUND: 'CAMERA_NOT_FOUND',
    GATE_NOT_FOUND: 'GATE_NOT_FOUND',
    CAMERA_DUPLICATE_NAME: 'CAMERA_DUPLICATE_NAME',

    // --- SERVICES ---
    SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
    SERVICE_DEFINITION_NOT_FOUND: 'SERVICE_DEFINITION_NOT_FOUND',
    SERVICE_BUNDLE_NOT_FOUND: 'SERVICE_BUNDLE_NOT_FOUND',

    // --- VEHICLES ---
    VEHICLE_NOT_FOUND: 'VEHICLE_NOT_FOUND',
    VEHICLE_DUPLICATE_PLATE: 'VEHICLE_DUPLICATE_PLATE',
    VEHICLE_ALREADY_REGISTERED: 'VEHICLE_ALREADY_REGISTERED',

    // --- FILES ---
    FILE_NOT_FOUND: 'FILE_NOT_FOUND',

    // --- ADDRESS ---
    ADDRESS_NOT_FOUND: 'ADDRESS_NOT_FOUND',

    // --- ADMINS ---
    ADMIN_ROLE_NOT_FOUND: 'ADMIN_ROLE_NOT_FOUND',

    // --- GENERIC / FALLBACK ---
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',

    // --- GUESTS ---
    GUEST_USER_ID_REQUIRED: 'GUEST_USER_ID_REQUIRED',

} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

/**
 * Mapping configuration for Database Errors (PostgreSQL) -> Application Error Codes.
 * Keys are typically table names or specific constraint names.
 */
export interface DbErrorMapEntry {
    code: ErrorCodeType;
    message?: string;
}

export const DbErrorConfiguration: Record<
    string, // PostgreSQL Error Code (e.g., '23505')
    Record<string, DbErrorMapEntry> // Table Name or Constraint Name -> Error Code
> = {
    // Unique Violation
    '23505': {
        // Sectors
        'sectors_name_key': { code: ErrorCode.SECTOR_DUPLICATE_NAME, message: 'A sector with this name already exists.' },
        'sectors_name_unique': { code: ErrorCode.SECTOR_DUPLICATE_NAME, message: 'A sector with this name already exists.' },

        // Buildings
        'buildings_name_key': { code: ErrorCode.BUILDING_DUPLICATE_NAME, message: 'A building with this name already exists.' },
        'buildings_code_key': { code: ErrorCode.BUILDING_DUPLICATE_CODE, message: 'A building with this code already exists.' },

        // Units
        'units_unit_number_key': { code: ErrorCode.UNIT_DUPLICATE_NUMBER, message: 'A unit with this number already exists.' },
        'contract_user_unit_unique': { code: ErrorCode.CONTRACT_DUPLICATE, message: 'A contract for this user and unit already exists.' },
        'contract_unit_active_unique': { code: ErrorCode.CONTRACT_UNIT_ALREADY_ACTIVE, message: 'This unit already has an active contract.' },

        // Users
        'users_email_unique': { code: ErrorCode.USER_EMAIL_ALREADY_EXISTS, message: 'A user with this email already exists.' },
        'admins_email_unique': { code: ErrorCode.USER_EMAIL_ALREADY_EXISTS, message: 'An admin with this email already exists.' },
        'users_phone_number_unique': { code: ErrorCode.USER_PHONE_ALREADY_EXISTS, message: 'A user with this phone number already exists.' },
        'uq_users_phone_number': { code: ErrorCode.USER_PHONE_ALREADY_EXISTS, message: 'A user with this phone number already exists.' },
        'uq_admins_email': { code: ErrorCode.USER_EMAIL_ALREADY_EXISTS, message: 'An admin with this email already exists.' },

        // Documents
        'documents_reference_key': { code: ErrorCode.DOCUMENT_DUPLICATE_REFERENCE, message: 'A document with this reference number already exists.' },

        // Vehicles
        'vehicle_plate_number_unique': { code: ErrorCode.VEHICLE_DUPLICATE_PLATE, message: 'A vehicle with this plate number already exists.' },
        'uq_vehicle_plate_number': { code: ErrorCode.VEHICLE_DUPLICATE_PLATE, message: 'A vehicle with this plate number already exists.' },

        // Contracts types
        'rent_contract_contract_unique': { code: ErrorCode.CONTRACT_DUPLICATE, message: 'Rent details already exist for this contract.' },
        'ownership_contract_contract_unique': { code: ErrorCode.CONTRACT_DUPLICATE, message: 'Ownership details already exist for this contract.' },
        'installment_contract_contract_unique': { code: ErrorCode.CONTRACT_DUPLICATE, message: 'Installment details already exist for this contract.' },
    },

    // Foreign Key Violation
    '23503': {
        // If we try to delete a sector that has buildings
        'buildings_sector_id_fkey': { code: ErrorCode.SECTOR_HAS_ACTIVE_BUILDINGS, message: 'Cannot delete sector because it has active buildings.' },
        // If we try to delete a building that has units
        'units_building_id_fkey': { code: ErrorCode.BUILDING_HAS_ACTIVE_UNITS, message: 'Cannot delete building because it has active units.' },
        'floors_building_id_fkey': { code: ErrorCode.BUILDING_HAS_ACTIVE_FLOORS, message: 'Cannot delete building because it has active floors.' },
        'blocks_building_id_fkey': { code: ErrorCode.BUILDING_HAS_ACTIVE_BLOCKS, message: 'Cannot delete building because it has active blocks.' },

        // Floors/Blocks deletions
        'units_floor_id_fkey': { code: ErrorCode.FLOOR_HAS_ACTIVE_UNITS, message: 'Cannot delete floor because it has active units.' },
        'units_block_id_fkey': { code: ErrorCode.BLOCK_HAS_ACTIVE_UNITS, message: 'Cannot delete block because it has active units.' },

        // Unit deletion
        'contracts_unit_id_fkey': { code: ErrorCode.UNIT_HAS_ACTIVE_CONTRACTS, message: 'Cannot delete unit because it has active contracts.' },

        // User deletion
        'contracts_user_id_fkey': { code: ErrorCode.USER_HAS_ACTIVE_CONTRACTS, message: 'Cannot delete user because they have active contracts.' },

        // Invoice deletion
        'payments_invoice_id_fkey': { code: ErrorCode.INVOICE_HAS_ACTIVE_PAYMENTS, message: 'Cannot delete invoice because it has associated payments.' },

        // Contract deletion
        'invoices_contractId_fkey': { code: ErrorCode.CONTRACT_HAS_ACTIVE_INVOICES, message: 'Cannot delete contract because it has associated invoices.' },
    }
};
