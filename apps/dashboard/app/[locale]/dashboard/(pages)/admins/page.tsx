import PageContainer from "@/components/page-container";
import SiteHeader from "@/components/site-header";
import AddAdminSheet from "@/features/admins/domains/admins/components/sheets/add-admin-sheet";
import AdminDataTable from "@/features/admins/domains/admins/components/table/admin-data-table";
import { AnimatedButton, LocalizedText } from "@mono-repo-template/ui";
import { UserPlus } from "lucide-react";
import { getTranslations } from "next-intl/server";

const Admins = async () => {
  const t = await getTranslations();
  return (
    <PageContainer>
      <SiteHeader
        pageTitle={t("admins.title")}
        pageDescription={t("admins.description")}
      >
        <AddAdminSheet>
          <AnimatedButton variant="default" size="sm">
            <UserPlus size={16} />
            <LocalizedText className="ms-2" text={t("admins.button")} />
          </AnimatedButton>
        </AddAdminSheet>
      </SiteHeader>
      <AdminDataTable />
    </PageContainer>
  );
};

export default Admins;
