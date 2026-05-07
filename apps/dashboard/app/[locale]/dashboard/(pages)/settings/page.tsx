import PageContainer from "@/components/page-container";
import SiteHeader from "@/components/site-header";
import SettingsTabs from "@/features/settings/components/settings-tabs";
import { getTranslations } from "next-intl/server";

const SettingsPage = async () => {
  const t = await getTranslations("settings");

  return (
    <PageContainer>
      <SiteHeader pageTitle={t("title")} pageDescription={t("description")} />
      <SettingsTabs />
    </PageContainer>
  );
};

export default SettingsPage;
