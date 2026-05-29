import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLimit = vi.fn();
const mockInsert = vi.fn();
const mockValues = vi.fn();
const mockOnConflictDoUpdate = vi.fn();

vi.mock("$lib/server/db", () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					limit: mockLimit,
				})),
			})),
		})),
		insert: mockInsert.mockReturnValue({
			values: mockValues.mockReturnValue({
				onConflictDoUpdate: mockOnConflictDoUpdate,
			}),
		}),
	},
}));

const userId = "user-1";
const blockId = "block-1";
const lessonId = "lesson-1";

describe("completeBlock", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns alreadyCompleted when block already completed", async () => {
		mockLimit.mockResolvedValueOnce([
			{ id: "comp-1", userId, blockId, lessonId, completedAt: new Date() },
		]);

		const { completeBlock } = await import("../gamification.js");
		const result = await completeBlock(userId, blockId, lessonId, 100);

		expect(result).toEqual({ alreadyCompleted: true });
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it("creates progression from scratch and awards XP", async () => {
		mockLimit.mockResolvedValueOnce([]);
		mockLimit.mockResolvedValueOnce([]);

		mockOnConflictDoUpdate.mockResolvedValue(undefined);

		const { completeBlock } = await import("../gamification.js");
		const result = await completeBlock(userId, blockId, lessonId, 100);

		expect(result).toEqual({
			xpEarned: 100,
			totalXp: 100,
			level: 1,
			leveledUp: false,
			currentStreak: 1,
		});
	});

	it("adds XP to existing progression", async () => {
		mockLimit.mockResolvedValueOnce([]);
		mockLimit.mockResolvedValueOnce([
			{
				userId,
				xp: 200,
				level: 1,
				currentStreak: 3,
				longestStreak: 3,
				lastActiveAt: new Date(),
			},
		]);

		mockOnConflictDoUpdate.mockResolvedValue(undefined);

		const { completeBlock } = await import("../gamification.js");
		const result = await completeBlock(userId, blockId, lessonId, 150);

		expect(result).toEqual({
			xpEarned: 150,
			totalXp: 350,
			level: 1,
			leveledUp: false,
			currentStreak: 4,
		});
	});

	it("levels up when XP crosses threshold", async () => {
		mockLimit.mockResolvedValueOnce([]);
		mockLimit.mockResolvedValueOnce([
			{
				userId,
				xp: 450,
				level: 1,
				currentStreak: 1,
				longestStreak: 1,
				lastActiveAt: new Date(),
			},
		]);

		mockOnConflictDoUpdate.mockResolvedValue(undefined);

		const { completeBlock } = await import("../gamification.js");
		const result = await completeBlock(userId, blockId, lessonId, 100);

		expect(result).toMatchObject({
			xpEarned: 100,
			totalXp: 550,
			level: 2,
			leveledUp: true,
		});
	});

	it("resets streak when more than 48h since last active", async () => {
		const lastActive = new Date();
		lastActive.setHours(lastActive.getHours() - 72);

		mockLimit.mockResolvedValueOnce([]);
		mockLimit.mockResolvedValueOnce([
			{
				userId,
				xp: 100,
				level: 1,
				currentStreak: 5,
				longestStreak: 5,
				lastActiveAt: lastActive,
			},
		]);

		mockOnConflictDoUpdate.mockResolvedValue(undefined);

		const { completeBlock } = await import("../gamification.js");
		const result = await completeBlock(userId, blockId, lessonId, 100);

		expect(result).toMatchObject({
			currentStreak: 1,
		});
	});

	it("maintains streak within 48h window", async () => {
		const lastActive = new Date();
		lastActive.setHours(lastActive.getHours() - 24);

		mockLimit.mockResolvedValueOnce([]);
		mockLimit.mockResolvedValueOnce([
			{
				userId,
				xp: 100,
				level: 1,
				currentStreak: 3,
				longestStreak: 5,
				lastActiveAt: lastActive,
			},
		]);

		mockOnConflictDoUpdate.mockResolvedValue(undefined);

		const { completeBlock } = await import("../gamification.js");
		const result = await completeBlock(userId, blockId, lessonId, 100);

		expect(result).toMatchObject({
			currentStreak: 4,
		});
	});

	it("updates longestStreak when current streak exceeds it", async () => {
		mockLimit.mockResolvedValueOnce([]);
		mockLimit.mockResolvedValueOnce([
			{
				userId,
				xp: 0,
				level: 1,
				currentStreak: 0,
				longestStreak: 0,
				lastActiveAt: null,
			},
		]);

		mockOnConflictDoUpdate.mockResolvedValue(undefined);

		const { completeBlock } = await import("../gamification.js");
		const result = await completeBlock(userId, blockId, lessonId, 100);

		expect(result).toMatchObject({
			currentStreak: 1,
		});
	});
});
