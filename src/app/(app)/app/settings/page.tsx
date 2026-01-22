import { AppPage } from "@/components/app/app-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
	return (
		<AppPage title="Settings" subtitle="Account">
			<Card className="border-emerald-900/10 bg-white/80">
				<CardHeader>
					<CardTitle className="font-display text-xl text-emerald-950">
						Settings coming soon
					</CardTitle>
				</CardHeader>
				<CardContent className="text-sm text-emerald-900/70">
					Profile preferences and session controls will appear here.
				</CardContent>
			</Card>
		</AppPage>
	);
}
