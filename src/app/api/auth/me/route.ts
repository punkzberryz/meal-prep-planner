import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

const UpdateProfileSchema = z.object({
	name: z.string().trim().min(1).nullable().optional(),
});

async function getSessionUser() {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

	if (!token) return null;

	const payload = verifyAuthToken(token);
	if (!payload) return null;

	const session = await prisma.session.findUnique({
		where: { jti: payload.jti },
		include: { user: true },
	});

	if (!session || session.revokedAt || session.expiresAt < new Date()) {
		return null;
	}

	return session.user;
}

export async function GET() {
	const user = await getSessionUser();
	if (!user) {
		return NextResponse.json({ user: null }, { status: 401 });
	}

	return NextResponse.json({
		user: {
			id: user.id,
			email: user.email,
			name: user.name,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		},
	});
}

export async function PATCH(request: Request) {
	const user = await getSessionUser();
	if (!user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json().catch(() => null);
	const parsed = UpdateProfileSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json({ error: "Invalid input." }, { status: 400 });
	}

	const rawName = parsed.data.name;
	const normalizedName =
		typeof rawName === "string" && rawName.trim() !== ""
			? rawName.trim()
			: null;

	const updated = await prisma.user.update({
		where: { id: user.id },
		data: { name: normalizedName },
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
