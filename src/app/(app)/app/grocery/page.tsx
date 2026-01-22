import Image from "next/image";
import { AppPage } from "@/components/app/app-page";

export default function GroceryPage() {
	return (
		<AppPage title="Grocery list" subtitle="Weekly essentials">
			<div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 rounded-2xl border border-border/60 bg-card/70 p-6 text-center">
				<Image
					src="/assets/illustrations/empty-grocery.webp"
					alt="Empty grocery list illustration"
					width={320}
					height={320}
					className="h-40 w-40"
				/>
				<div className="space-y-1">
					<p className="text-sm font-medium text-foreground">
						No grocery list yet.
					</p>
					<p className="text-sm text-muted-foreground">
						Generate a plan to turn your meals into a shopping list.
					</p>
				</div>
			</div>
		</AppPage>
	);
}
