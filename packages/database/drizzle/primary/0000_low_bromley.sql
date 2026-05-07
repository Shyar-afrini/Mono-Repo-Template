CREATE TYPE "public"."permission" AS ENUM('admin:read', 'admin:write', 'admin:delete');--> statement-breakpoint
CREATE TABLE "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fullname" varchar(120) NOT NULL,
	"email" varchar(320) NOT NULL,
	"password" varchar(255) NOT NULL,
	"phone_number" varchar(32),
	"profile_photo" text,
	"role_id" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permissions" "permission" NOT NULL,
	CONSTRAINT "role_permissions_role_id_permissions_pk" PRIMARY KEY("role_id","permissions")
);
--> statement-breakpoint
ALTER TABLE "role_permissions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(64) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_token" text NOT NULL,
	"admin_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

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

--> statement-breakpoint
ALTER TABLE "admin_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "admins" ADD CONSTRAINT "admins_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_admins_email" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_admins_created_at" ON "admins" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_admins_is_active" ON "admins" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "admin_sessions_admin_id_idx" ON "admin_sessions" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "admin_sessions_expires_at_idx" ON "admin_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "admin_sessions_admin_id_expires_idx" ON "admin_sessions" USING btree ("admin_id","expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_sessions_session_token_uq" ON "admin_sessions" USING btree ("session_token");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_sessions_admin_token_uq" ON "admin_sessions" USING btree ("admin_id","session_token");--> statement-breakpoint
CREATE POLICY "admins_select" ON "admins" AS PERMISSIVE FOR SELECT TO public USING ("admins"."id" = (current_setting('app.user_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "admins_update" ON "admins" AS PERMISSIVE FOR UPDATE TO public USING ("admins"."id" = (current_setting('app.user_id', true))::uuid) WITH CHECK ("admins"."id" = (current_setting('app.user_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "admins_insert_self" ON "admins" AS PERMISSIVE FOR INSERT TO public WITH CHECK ("admins"."id" = (current_setting('app.user_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "role_permissions_select" ON "role_permissions" AS PERMISSIVE FOR SELECT TO public USING (public.check_permission('admin:read'));--> statement-breakpoint
CREATE POLICY "role_permissions_insert" ON "role_permissions" AS PERMISSIVE FOR INSERT TO public WITH CHECK (public.check_permission('admin:write'));--> statement-breakpoint
CREATE POLICY "role_permissions_update" ON "role_permissions" AS PERMISSIVE FOR UPDATE TO public USING (public.check_permission('admin:write')) WITH CHECK (public.check_permission('admin:write'));--> statement-breakpoint
CREATE POLICY "role_permissions_delete" ON "role_permissions" AS PERMISSIVE FOR DELETE TO public USING (public.check_permission('admin:delete'));--> statement-breakpoint
CREATE POLICY "roles_select" ON "roles" AS PERMISSIVE FOR SELECT TO public USING (public.check_permission('admin:read'));--> statement-breakpoint
CREATE POLICY "roles_insert" ON "roles" AS PERMISSIVE FOR INSERT TO public WITH CHECK (public.check_permission('admin:write'));--> statement-breakpoint
CREATE POLICY "roles_update" ON "roles" AS PERMISSIVE FOR UPDATE TO public USING (public.check_permission('admin:write')) WITH CHECK (public.check_permission('admin:write'));--> statement-breakpoint
CREATE POLICY "roles_delete" ON "roles" AS PERMISSIVE FOR DELETE TO public USING (public.check_permission('admin:delete'));--> statement-breakpoint
CREATE POLICY "admin_sessions_select" ON "admin_sessions" AS PERMISSIVE FOR SELECT TO public USING ("admin_sessions"."admin_id" = (current_setting('app.user_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "admin_sessions_insert" ON "admin_sessions" AS PERMISSIVE FOR INSERT TO public WITH CHECK ("admin_sessions"."admin_id" = (current_setting('app.user_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "admin_sessions_update" ON "admin_sessions" AS PERMISSIVE FOR UPDATE TO public USING ("admin_sessions"."admin_id" = (current_setting('app.user_id', true))::uuid) WITH CHECK ("admin_sessions"."admin_id" = (current_setting('app.user_id', true))::uuid);--> statement-breakpoint
CREATE POLICY "admin_sessions_delete" ON "admin_sessions" AS PERMISSIVE FOR DELETE TO public USING ("admin_sessions"."admin_id" = (current_setting('app.user_id', true))::uuid);