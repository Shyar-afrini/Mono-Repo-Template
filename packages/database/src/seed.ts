import { hash } from "@mono-repo-template/backend/utils";
import { primaryDb } from "./clients/primary";
import { ROLE_PRESETS } from "./constants/permissions";
import { admins } from "./schema/primary/admins";
import { rolePermissions, roles } from "./schema/primary/permissions";
import { createCheckPermissionFunction, setErbilTimezone } from "./utils";

const seed = async () => {
  try {
    console.log("Seeding started...");

    // Ensure timezone is set for both databases permanently
    await setErbilTimezone(primaryDb);

    // Create the check_permission function for RLS policies
    await createCheckPermissionFunction(primaryDb);

    // 1 & 2. Create Roles and Assign Permissions
    let superAdminRole: any = null;
    const roleMap: Record<string, string> = {}; // roleName → role.id

    for (const [roleName, permissions] of Object.entries(ROLE_PRESETS)) {
      const [role] = await primaryDb
        .insert(roles)
        .values({
          name: roleName,
          isPrimary: true,
        })
        .onConflictDoUpdate({
          target: roles.name,
          set: { isPrimary: true },
        })
        .returning();

      roleMap[roleName] = role.id;

      if (permissions.length > 0) {
        const permissionsToInsert = permissions.map((permission) => ({
          roleId: role.id,
          permissions: permission as any,
        }));

        await primaryDb
          .insert(rolePermissions)
          .values(permissionsToInsert)
          .onConflictDoNothing();
      }

      if (roleName === "SuperAdmin") {
        superAdminRole = role;
      }
    }
    console.log("Created roles and assigned permissions");

    // 3. Create Admin User
    const hashedPassword = hash("admin123");

    const [superAdmin] = await primaryDb
      .insert(admins)
      .values({
        fullname: "Super Admin",
        email: "admin@kakonsoft.com",
        password: hashedPassword,
        roleId: superAdminRole.id,
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();
    console.log("Created Super Admin user");

    console.log("Seeding completed successfully");
  } catch (error) {
    console.error("Seeding failed:", error);

  }
};

seed()
  .then(() => {
    console.log("Exiting seed process...");
    process.exit();
  })
  .catch((err) => {
    console.error("Process failed:", err);
    process.exit(1);
  });

