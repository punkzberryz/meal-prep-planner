import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE_NAME, signAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const runtime = "nodejs";

const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);
	const parsed = LoginSchema.safeParse(body);

	if (!parsed.success) {
		return NextResponse.json(
			{ error: "Invalid credentials." },
			{ status: 400 },
		);
	}

	const { email, password } = parsed.data;
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) {
		return NextResponse.json(
			{ error: "Invalid credentials." },
			{ status: 401 },
		);
	}

	const valid = await verifyPassword(password, user.passwordHash);
	if (!valid) {
		return NextResponse.json(
			{ error: "Invalid credentials." },
			{ status: 401 },
		);
	}

	const jti = randomUUID();
	const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

	await prisma.session.create({
		data: { userId: user.id, jti, expiresAt },
	});

	const token = signAuthToken({ sub: user.id, jti }, expiresAt);
	const response = NextResponse.json({
		user: { id: user.id, email: user.email, name: user.name },
	});

	response.cookies.set(SESSION_COOKIE_NAME, token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		path: "/",
		expires: expiresAt,
	});

	return response;
}
