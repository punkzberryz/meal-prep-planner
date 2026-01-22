import {
	CalendarDaysIcon,
	ListChecksIcon,
	ShoppingBasketIcon,
	UtensilsCrossedIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { UserSection } from "@/components/app/user-section";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
} from "@/components/ui/sidebar";

const navigation = [
	{ label: "Dashboard", href: "/app", icon: CalendarDaysIcon },
	{ label: "Meals", href: "/app/meals", icon: UtensilsCrossedIcon },
	{ label: "Plans", href: "/app/plans", icon: ListChecksIcon },
	{ label: "Grocery", href: "/app/grocery", icon: ShoppingBasketIcon },
];

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider defaultOpen>
			<Sidebar variant="inset">
				<SidebarHeader>
					<div className="flex items-center gap-3 px-2 py-2">
						<div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-card shadow-sm">
							<Image
								src="/assets/icons/icon.jpg"
								alt="Meal Prep Planner icon"
								width={40}
								height={40}
								className="h-full w-full object-cover"
							/>
						</div>
						<div className="leading-tight">
							<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
								Meal Prep
							</p>
							<p className="font-display text-lg text-foreground">Planner</p>
						</div>
					</div>
				</SidebarHeader>
				<SidebarContent>
					<SidebarMenu>
						{navigation.map((item) => (
							<SidebarMenuItem key={item.href}>
								<SidebarMenuButton asChild>
									<Link href={item.href} className="gap-3">
										<item.icon className="h-4 w-4" />
										<span>{item.label}</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarContent>
				<SidebarFooter>
					<UserSection />
				</SidebarFooter>
			</Sidebar>
			<SidebarInset className="bg-[radial-gradient(circle_at_top,_rgba(246,214,120,0.18),_rgba(255,244,230,0.9)_45%,_rgba(255,244,230,1)_100%)]">
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
