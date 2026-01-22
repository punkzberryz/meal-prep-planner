import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const testDbUrl = "file:./test-user-create.db";
const testDbPath = path.resolve("test-user-create.db");

const adapter = new PrismaBetterSqlite3({ url: testDbUrl });
const prisma = new PrismaClient({ adapter });

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
	await prisma.$disconnect();
	if (existsSync(testDbPath)) {
		unlinkSync(testDbPath);
	}
});

test("creates a user record", async () => {
	const email = `test-${Date.now()}@example.com`;

	const user = await prisma.user.create({
		data: {
			email,
			passwordHash: "hash",
		},
	});

	expect(user.email).toBe(email);
});
