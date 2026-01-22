import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
				secondary:
					"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
				outline: "text-foreground",
				// Custom sunrise palette variants
				apricot:
					"border-transparent bg-[#fbceb1] text-[#713f12] hover:bg-[#fbceb1]/80",
				coral:
					"border-transparent bg-[#ff7f50] text-white hover:bg-[#ff7f50]/80",
				sunny:
					"border-transparent bg-[#fef08a] text-[#713f12] hover:bg-[#fef08a]/80",
				mint: "border-transparent bg-[#d1fae5] text-[#064e3b] hover:bg-[#d1fae5]/80",
				cream:
					"border-transparent bg-[#fff7ed] text-[#7c2d12] hover:bg-[#fff7ed]/80",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {
	children?: React.ReactNode;
}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
