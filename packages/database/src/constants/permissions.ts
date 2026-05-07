export const ALL_PERMISSIONS = [
  // --- User Management ---
  "admin:read",
  "admin:write",
  "admin:delete",
];


export const ROLE_PRESETS: Record<string, string[]> = {
  SuperAdmin: ALL_PERMISSIONS,
  Admin: ALL_PERMISSIONS,
};
