import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const PasswordSchema = z.object({
	currentPassword: z.string().min(1),
	nextPassword: z.string().min(8),
});

export async function POST(request: Request) {
	const session = await getSession();
	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const parsed = PasswordSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid input." }, { status: 400 });
	}

	const { currentPassword, nextPassword } = parsed.data;
	const user = await prisma.user.findUnique({
		where: { id: session.userId },
	});

	if (!user) {
		return NextResponse.json({ error: "User not found." }, { status: 404 });
	}

	const valid = await verifyPassword(currentPassword, user.passwordHash);
	if (!valid) {
		return NextResponse.json(
			{ error: "Current password is incorrect." },
			{ status: 401 },
		);
	}

	const nextHash = await hashPassword(nextPassword);
	const updated = await prisma.user.update({
		where: { id: user.id },
		data: { passwordHash: nextHash },
	});

	return NextResponse.json({
		user: {
			id: updated.id,
			email: updated.email,
			name: updated.name,
			createdAt: updated.createdAt.toISOString(),
			updatedAt: updated.updatedAt.toISOString(),
		},
	});
}
