import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";

const testDbUrl = "file:./test.db";
const testDbPath = path.resolve("test.db");

async function getPrisma() {
	const module = await import("../src/lib/db");
	return module.prisma;
}

beforeAll(() => {
	process.env.DATABASE_URL = testDbUrl;
	if (existsSync(testDbPath)) {
		unlinkSync(testDbPath);
	}
	execSync("pnpm prisma migrate deploy", {
		stdio: "inherit",
		env: {
			...process.env,
			DATABASE_URL: testDbUrl,
		},
	});
});

afterAll(async () => {
	const prisma = await getPrisma();
	await prisma.$disconnect();
	if (existsSync(testDbPath)) {
		unlinkSync(testDbPath);
	}
});

test("creates a user record", async () => {
	const prisma = await getPrisma();
	const email = `test-${Date.now()}@example.com`;

	const user = await prisma.user.create({
		data: {
			email,
			passwordHash: "hash",
		},
	});

	expect(user.email).toBe(email);
});
