import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const databaseUrl =
	process.env.DATABASE_URL ??
	process.env.PRISMA_DATABASE_URL ??
	"file:./dev.db";

if (!databaseUrl.startsWith("file:") && databaseUrl !== ":memory:") {
	throw new Error('DATABASE_URL must start with "file:" for SQLite.');
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

function parseArgs(argv) {
	const args = { _: [], flags: {} };
	for (let i = 0; i < argv.length; i += 1) {
		const value = argv[i];
		if (value?.startsWith("--")) {
			const key = value.slice(2);
			const next = argv[i + 1];
			if (!next || next.startsWith("--")) {
				args.flags[key] = true;
			} else {
				args.flags[key] = next;
				i += 1;
			}
		} else {
			args._.push(value);
		}
	}
	return args;
}

function usage() {
	return [
		"Usage:",
		"  node scripts/db-inspect.mjs users",
		"  node scripts/db-inspect.mjs meals --user <email|id> [--full]",
		"  node scripts/db-inspect.mjs plans --user <email|id> [--week-start YYYY-MM-DD]",
		"  node scripts/db-inspect.mjs grocery --user <email|id> [--week-start YYYY-MM-DD]",
	].join("\n");
}

function getWeekStart(date) {
	const start = new Date(date);
	start.setHours(0, 0, 0, 0);
	const day = start.getDay();
	const diff = (day + 6) % 7;
	start.setDate(start.getDate() - diff);
	return start;
}

async function resolveUserId(value) {
	if (!value) return null;
	const user = await prisma.user.findFirst({
		where: value.includes("@") ? { email: value } : { id: value },
		select: { id: true, email: true, name: true },
	});
	return user;
}

function aggregateIngredients(lines) {
	const map = new Map();
	for (const line of lines) {
		const text = line.text.trim();
		if (!text) continue;
		const existing = map.get(text);
		if (existing) {
			existing.count += 1;
		} else {
			map.set(text, { text, count: 1 });
		}
	}
	return Array.from(map.values());
}

async function listUsers() {
	const users = await prisma.user.findMany({
		select: { id: true, email: true, name: true },
		orderBy: { createdAt: "asc" },
	});
	console.table(users);
}

async function listMeals(userId, full) {
	const meals = await prisma.meal.findMany({
		where: { userId },
		include: { ingredients: { orderBy: { position: "asc" } } },
		orderBy: { name: "asc" },
	});
	for (const meal of meals) {
		console.log(`\n${meal.name} (servings: ${meal.servings ?? "n/a"})`);
		if (full) {
			for (const ingredient of meal.ingredients) {
				console.log(`- ${ingredient.text}`);
			}
		}
	}
	console.log(`\nTotal meals: ${meals.length}`);
}

async function listPlans(userId, weekStart) {
	const where = weekStart ? { userId, weekStart } : { userId };
	const plans = await prisma.weeklyPlan.findMany({
		where,
		include: {
			slots: {
				include: { meal: { select: { name: true } } },
				orderBy: [{ date: "asc" }, { type: "asc" }],
			},
		},
		orderBy: { weekStart: "desc" },
	});

	for (const plan of plans) {
		console.log(`\nWeek of ${plan.weekStart.toISOString().slice(0, 10)}`);
		for (const slot of plan.slots) {
			console.log(
				`${slot.date.toISOString().slice(0, 10)} ${slot.type}: ${
					slot.meal?.name ?? "Unassigned"
				}`,
			);
		}
	}
	console.log(`\nTotal plans: ${plans.length}`);
}

async function listGrocery(userId, weekStart) {
	const plan = await prisma.weeklyPlan.findUnique({
		where: { userId_weekStart: { userId, weekStart } },
		include: {
			slots: {
				include: { meal: { include: { ingredients: true } } },
			},
		},
	});
	if (!plan) {
		console.log("No plan found for that week.");
		return;
	}

	const lines = plan.slots.flatMap((slot) =>
		slot.meal
			? slot.meal.ingredients.map((ingredient) => ({
					text: ingredient.text,
				}))
			: [],
	);

	const items = aggregateIngredients(lines);
	console.log(`Grocery list for week of ${plan.weekStart.toISOString().slice(0, 10)}`);
	for (const item of items) {
		console.log(`- ${item.text}${item.count > 1 ? ` (x${item.count})` : ""}`);
	}
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const command = args._[0];

	if (!command) {
		console.log(usage());
		return;
	}

	if (command === "users") {
		await listUsers();
		return;
	}

	const userValue = args.flags.user;
	const user = await resolveUserId(userValue);
	if (!user) {
		console.log("User not found. Pass --user <email|id>.");
		return;
	}

	if (command === "meals") {
		await listMeals(user.id, Boolean(args.flags.full));
		return;
	}

	const weekStartValue = args.flags["week-start"];
	const weekStartDate = getWeekStart(
		weekStartValue ? new Date(`${weekStartValue}T00:00:00`) : new Date(),
	);

	if (command === "plans") {
		await listPlans(user.id, weekStartValue ? weekStartDate : undefined);
		return;
	}

	if (command === "grocery") {
		await listGrocery(user.id, weekStartDate);
		return;
	}

	console.log(usage());
}

main()
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
