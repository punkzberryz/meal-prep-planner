import { ProfileBasicsCard } from "@/components/settings/profile-basics-card";
import { SecurityCard } from "@/components/settings/security-card";

export function SettingsContent() {
	return (
		<div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
			<ProfileBasicsCard />
			<SecurityCard />
		</div>
	);
}
