import PageContainer from "@/components/page-container";
import SiteHeader from "@/components/site-header";
import CreateRoleDialog from "@/features/admins/domains/roles/components/dialogs/create-role-dialog";
import RolesPage from "@/features/admins/domains/roles/components/roles-page";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mono-repo-template/ui";
import { getTranslations } from "next-intl/server";

const RolesAndPermissionsPage = async () => {
  const t = await getTranslations();

  return (
    <PageContainer>
      <SiteHeader
        pageTitle={t("roles.page.title")}
        pageDescription={t("roles.page.description")}
      >
        <CreateRoleDialog />
      </SiteHeader>
      <Tabs defaultValue="roles" className="mt-4">
        <TabsList className="dark:bg-background bg-zinc-50 border dark:border-border border-zinc-200 rounded-md p-1 h-auto">
          <TabsTrigger
            value="roles"
            className="data-[state=active]:bg-primary p-2 px-6 data-[state=active]:text-primary-foreground disabled:opacity-50 disabled:pointer-events-none"
          >
            {t("roles.tabs.roles")}
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-primary p-2 px-6 data-[state=active]:text-primary-foreground disabled:opacity-50 disabled:pointer-events-none"
            value="permissions"
            disabled
          >
            {t("roles.tabs.permissions")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="roles">
          <RolesPage />
        </TabsContent>
        <TabsContent value="permissions">
          {/* Placeholder for future permissions UI */}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
};

export default RolesAndPermissionsPage;
