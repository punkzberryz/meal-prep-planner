"use client";

import { useQueryClient } from "@tanstack/react-query";
import { LogOutIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuthMe, useLogout } from "@/lib/queries/auth";
import { queryKeys } from "@/lib/query-keys";

export function UserSection() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const { data } = useAuthMe();
	const logout = useLogout();
	const user = data?.user ?? null;

	const displayName = user?.name || user?.email || "User";
	const initials = useMemo(() => {
		const base = displayName.trim() || "User";
		const parts = base.split(/\s+/);
		const letters =
			parts.length > 1
				? `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`
				: base.slice(0, 2);
		return letters.toUpperCase();
	}, [displayName]);

	async function handleLogout() {
		await logout.mutateAsync();
		queryClient.setQueryData(queryKeys.auth.me, { user: null });
		router.push("/");
		router.refresh();
	}

	return (
		<div className="space-y-2 px-1">
			<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
				User
			</p>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="gap-3 text-foreground hover:bg-accent/40"
							>
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
									{initials}
								</div>
								<div className="flex flex-col text-left">
									<span className="text-sm font-medium text-foreground">
										{displayName}
									</span>
									<span className="text-xs text-muted-foreground">Account</span>
								</div>
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start" className="w-56">
							<DropdownMenuLabel>{displayName}</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link href="/app/settings" className="gap-2">
									<UserRoundIcon className="h-4 w-4" />
									<span>Edit profile</span>
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem onSelect={handleLogout} className="gap-2">
								<LogOutIcon className="h-4 w-4" />
								<span>Log out</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
		</div>
	);
}
