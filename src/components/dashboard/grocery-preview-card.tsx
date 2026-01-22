import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GroceryPreviewCard() {
	return (
		<Card className="border-border bg-card/75">
			<CardHeader>
				<CardTitle className="font-display text-lg text-foreground">
					Grocery list preview
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 text-sm text-muted-foreground">
				<div className="flex items-center justify-between">
					<span>Produce</span>
					<span>Spinach, lemons, peppers</span>
				</div>
				<div className="flex items-center justify-between">
					<span>Protein</span>
					<span>Chickpeas, tofu</span>
				</div>
				<div className="flex items-center justify-between">
					<span>Pantry</span>
					<span>Tahini, olive oil</span>
				</div>
				<Button variant="outline" className="w-full border-border">
					Copy list
				</Button>
			</CardContent>
		</Card>
	);
}
