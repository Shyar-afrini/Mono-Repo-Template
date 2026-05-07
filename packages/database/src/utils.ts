import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

/**
 * Permanently sets the PostgreSQL database timezone to Asia/Baghdad.
 * Uses dynamic SQL to avoid hardcoding the database name.
 */
export async function setErbilTimezone(db: NodePgDatabase<any>) {
    try {
        await db.execute(sql`
            DO $$
            BEGIN
              EXECUTE 'ALTER DATABASE ' || current_database() || ' SET timezone TO ''Asia/Baghdad''';
            END
            $$;
        `);
        console.log(`[Database] Timezone permanently set to Asia/Baghdad`);
    } catch (error) {
        console.error("[Database] Failed to set timezone:", error);
    }
}

/**
 * Creates the check_permission function for RLS policies.
 */
export async function createCheckPermissionFunction(db: NodePgDatabase<any>) {
    try {
        await db.execute(sql`
            CREATE OR REPLACE FUNCTION public.check_permission(required_permission "permission")
            RETURNS boolean
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            DECLARE
                current_admin_id uuid;
                has_permission boolean := false;
            BEGIN
                -- Get the current admin ID from the session
                current_admin_id := (current_setting('app.user_id', true))::uuid;
                
                -- If no admin ID is set, deny access
                IF current_admin_id IS NULL THEN
                    RETURN false;
                END IF;
                
                -- Check if the admin has the required permission
                SELECT EXISTS(
                    SELECT 1
                    FROM role_permissions rp
                    JOIN admins a ON a.role_id = rp.role_id
                    WHERE a.id = current_admin_id
                    AND a.is_active = true
                    AND rp.permissions = required_permission
                ) INTO has_permission;
                
                RETURN has_permission;
            END;
            $$;
        `);
        console.log(`[Database] check_permission function created/updated`);
    } catch (error) {
        console.error("[Database] Failed to create check_permission function:", error);
    }
}

/**
 * Helper to generate a RLS policy USING clause that checks a permission.
 * Example usage in a pgPolicy:
 *   using: checkPermissionUsing('admins:read')
 */
export function checkPermissionUsing(permission: string) {
    return sql`public.check_permission(${permission}::"Permissions")`;
}
