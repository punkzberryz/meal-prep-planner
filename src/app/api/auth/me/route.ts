import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
	const cookieStore = cookies();
	const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

	if (!token) {
		return NextResponse.json({ user: null }, { status: 401 });
	}

	const payload = verifyAuthToken(token);
	if (!payload) {
		return NextResponse.json({ user: null }, { status: 401 });
	}

	const session = await prisma.session.findUnique({
		where: { jti: payload.jti },
		include: { user: true },
	});

	if (!session || session.revokedAt || session.expiresAt < new Date()) {
		return NextResponse.json({ user: null }, { status: 401 });
	}

	return NextResponse.json({
		user: {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
		},
	});
}
