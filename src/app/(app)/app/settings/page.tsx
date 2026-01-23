import type { Metadata } from "next";
import { AppPage } from "@/components/app/app-page";
import { SettingsPageFallback } from "@/components/app/app-page-fallbacks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
			<Card className="border-border bg-card/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-foreground">
						Settings coming soon
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-muted-foreground">
					Profile preferences and session controls will appear here.
				</CardContent>
			</Card>
		</AppPage>
	);
}
