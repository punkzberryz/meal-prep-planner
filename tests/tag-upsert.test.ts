import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, expect, test } from "vitest";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";
import { normalizeTagValues } from "../src/lib/tags";

const testDbUrl = "file:./test-tag-upsert.db";
const testDbPath = path.resolve("test-tag-upsert.db");

const adapter = new PrismaBetterSqlite3({ url: testDbUrl });
const prisma = new PrismaClient({ adapter });

beforeAll(() => {
	process.env.DATABASE_URL = testDbUrl;
	if (existsSync(testDbPath)) unlinkSync(testDbPath);
	execSync("pnpm prisma migrate deploy", {
		stdio: "inherit",
		env: { ...process.env, DATABASE_URL: testDbUrl },
	});
});

afterAll(async () => {
	await prisma.$disconnect();
	if (existsSync(testDbPath)) unlinkSync(testDbPath);
});

test("tag upsert uses userId + valueKey uniqueness", async () => {
	const user = await prisma.user.create({
		data: { email: `test-${Date.now()}@example.com`, passwordHash: "hash" },
	});

	const [first] = normalizeTagValues([" Vegetarian "]);
	const second = { value: "vegetarian", valueKey: "vegetarian" };

	const created = await prisma.tag.upsert({
		where: { userId_valueKey: { userId: user.id, valueKey: first.valueKey } },
		create: { userId: user.id, value: first.value, valueKey: first.valueKey },
		update: { value: first.value },
	});

	const updated = await prisma.tag.upsert({
		where: { userId_valueKey: { userId: user.id, valueKey: second.valueKey } },
		create: { userId: user.id, value: second.value, valueKey: second.valueKey },
		update: { value: second.value },
	});

	expect(updated.id).toBe(created.id);
	expect(updated.valueKey).toBe("vegetarian");
});
