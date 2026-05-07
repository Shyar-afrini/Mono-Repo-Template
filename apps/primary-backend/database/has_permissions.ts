import { PrimaryDb, sql } from '@mono-repo-template/database';

export async function hasPermission(
  db: PrimaryDb,
  userId: string,
  permission: string,
): Promise<boolean> {
  const result = await db.execute<{ has_permission: boolean }>(
    sql`SELECT public.check_permission(${permission}::"Permissions", ${userId}::uuid) as has_permission`,
  );
  return result.rows[0]?.has_permission ?? false;
}
