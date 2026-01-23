import type { Metadata } from "next";
import { AppPage } from "@/components/app/app-page";
import { SettingsPageFallback } from "@/components/app/app-page-fallbacks";
import { SettingsContent } from "@/components/settings/settings-content";

export const metadata: Metadata = {
	title: "Settings",
};

export default function SettingsPage() {
	return (
		<AppPage
			title="Settings"
			subtitle="Account"
			fallback={<SettingsPageFallback />}
		>
			<SettingsContent />
		</AppPage>
	);
}
