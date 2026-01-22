import {
	CalendarDaysIcon,
	ListChecksIcon,
	UtensilsCrossedIcon,
} from "lucide-react";
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
];

export default function AppLayout({ children }: { children: ReactNode }) {
	return (
		<SidebarProvider defaultOpen>
			<Sidebar variant="inset">
				<SidebarHeader>
					<div className="flex items-center gap-3 px-2 py-2">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-900 text-white">
							MP
						</div>
						<div className="leading-tight">
							<p className="text-xs uppercase tracking-[0.2em] text-emerald-950/70">
								Meal Prep
							</p>
							<p className="font-display text-lg text-emerald-950">Planner</p>
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
			<SidebarInset className="bg-[#fbf7f0]">{children}</SidebarInset>
		</SidebarProvider>
	);
}
