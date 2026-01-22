"use client";

import { LogOutIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

type UserInfo = {
	name?: string | null;
	email?: string | null;
};

export function UserSection() {
	const router = useRouter();
	const [user, setUser] = useState<UserInfo | null>(null);

	useEffect(() => {
		let active = true;
		fetch("/api/auth/me")
			.then((response) => (response.ok ? response.json() : null))
			.then((data) => {
				if (!active) return;
				setUser(data?.user ?? null);
			})
			.catch(() => {
				if (!active) return;
				setUser(null);
			});
		return () => {
			active = false;
		};
	}, []);

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
		await fetch("/api/auth/logout", { method: "POST" });
		router.push("/");
		router.refresh();
	}

	return (
		<div className="space-y-2 px-1">
			<p className="text-xs uppercase tracking-[0.2em] text-emerald-100/70">
				User
			</p>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="gap-3 text-emerald-950 hover:bg-emerald-900/5"
							>
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-900 text-sm font-semibold text-white">
									{initials}
								</div>
								<div className="flex flex-col text-left">
									<span className="text-sm font-medium text-emerald-950">
										{displayName}
									</span>
									<span className="text-xs text-emerald-700">Account</span>
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
