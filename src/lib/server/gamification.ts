import { and, eq } from "drizzle-orm";
import { db } from "$lib/server/db";
import { userProgression, blockCompletions } from "$lib/server/db/schema";

const XP_PER_LEVEL = 500;
const STREAK_WINDOW_HOURS = 48;

export async function completeBlock(
	userId: string,
	blockId: string,
	lessonId: string,
	points: number,
) {
	const [existing] = await db
		.select()
		.from(blockCompletions)
		.where(
			and(
				eq(blockCompletions.userId, userId),
				eq(blockCompletions.blockId, blockId),
			),
		)
		.limit(1);

	if (existing) {
		return { alreadyCompleted: true };
	}

	await db.insert(blockCompletions).values({
		id: crypto.randomUUID(),
		userId,
		blockId,
		lessonId,
	});

	const [progression] = await db
		.select()
		.from(userProgression)
		.where(eq(userProgression.userId, userId))
		.limit(1);

	const now = new Date();
	let newStreak = progression?.currentStreak ?? 0;

	if (progression?.lastActiveAt) {
		const hoursSinceLast =
			(now.getTime() - new Date(progression.lastActiveAt).getTime()) /
			(1000 * 60 * 60);
		newStreak = hoursSinceLast <= STREAK_WINDOW_HOURS ? newStreak + 1 : 1;
	} else {
		newStreak = 1;
	}

	const currentXp = progression?.xp ?? 0;
	const currentLevel = progression?.level ?? 1;
	const newXp = currentXp + points;
	const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;

	await db
		.insert(userProgression)
		.values({
			userId,
			xp: newXp,
			level: newLevel,
			currentStreak: newStreak,
			longestStreak: Math.max(progression?.longestStreak ?? 0, newStreak),
			lastActiveAt: now,
		})
		.onConflictDoUpdate({
			target: userProgression.userId,
			set: {
				xp: newXp,
				level: newLevel,
				currentStreak: newStreak,
				longestStreak: Math.max(progression?.longestStreak ?? 0, newStreak),
				lastActiveAt: now,
			},
		});

	return {
		xpEarned: points,
		totalXp: newXp,
		level: newLevel,
		leveledUp: newLevel > currentLevel,
		currentStreak: newStreak,
	};
}
