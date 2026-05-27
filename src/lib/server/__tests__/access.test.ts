import { describe, it, expect, vi, beforeEach } from "vitest";

const mockLimit = vi.fn();

vi.mock("$lib/server/db", () => ({
	db: {
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					limit: mockLimit,
				})),
			})),
		})),
	},
}));

const userId = "user-1";
const courseId = "course-1";

function courseRow(overrides?: Record<string, unknown>) {
	return {
		id: courseId,
		title: "Test Course",
		description: "A test course",
		slug: "test-course",
		isPublished: true,
		price: 2999,
		freemiumLimit: null,
		...overrides,
	};
}

function enrollmentRow(overrides?: Record<string, unknown>) {
	return {
		id: "enr-1",
		userId,
		courseId,
		status: "freemium",
		freemiumLessonsViewed: 0,
		...overrides,
	};
}

describe("checkCourseAccess", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("returns not-found when course does not exist", async () => {
		mockLimit.mockResolvedValueOnce([]);
		mockLimit.mockResolvedValueOnce([]);

		const { checkCourseAccess } = await import("../access.js");
		const result = await checkCourseAccess(userId, courseId);

		expect(result).toEqual({ allowed: false, reason: "not-found" });
	});

	it("allows access for enrolled user with active status", async () => {
		mockLimit.mockResolvedValueOnce([courseRow()]);
		mockLimit.mockResolvedValueOnce([enrollmentRow({ status: "active" })]);

		const { checkCourseAccess } = await import("../access.js");
		const result = await checkCourseAccess(userId, courseId);

		expect(result).toEqual({ allowed: true });
	});

	it("allows access for free course regardless of enrollment", async () => {
		mockLimit.mockResolvedValueOnce([courseRow({ price: 0 })]);
		mockLimit.mockResolvedValueOnce([]);

		const { checkCourseAccess } = await import("../access.js");
		const result = await checkCourseAccess(userId, courseId);

		expect(result).toEqual({ allowed: true });
	});

	it("allows freemium access when within limit", async () => {
		mockLimit.mockResolvedValueOnce([courseRow({ freemiumLimit: 5 })]);
		mockLimit.mockResolvedValueOnce([
			enrollmentRow({ freemiumLessonsViewed: 2 }),
		]);

		const { checkCourseAccess } = await import("../access.js");
		const result = await checkCourseAccess(userId, courseId);

		expect(result).toEqual({ allowed: true, freemiumRemaining: 3 });
	});

	it("denies access when freemium limit reached", async () => {
		mockLimit.mockResolvedValueOnce([courseRow({ freemiumLimit: 5 })]);
		mockLimit.mockResolvedValueOnce([
			enrollmentRow({ freemiumLessonsViewed: 5 }),
		]);

		const { checkCourseAccess } = await import("../access.js");
		const result = await checkCourseAccess(userId, courseId);

		expect(result).toEqual({
			allowed: false,
			reason: "freemium-limit",
			freemiumLimit: 5,
			freemiumLessonsViewed: 5,
		});
	});

	it("denies access when freemium exceeds limit", async () => {
		mockLimit.mockResolvedValueOnce([courseRow({ freemiumLimit: 5 })]);
		mockLimit.mockResolvedValueOnce([
			enrollmentRow({ freemiumLessonsViewed: 7 }),
		]);

		const { checkCourseAccess } = await import("../access.js");
		const result = await checkCourseAccess(userId, courseId);

		expect(result).toEqual({
			allowed: false,
			reason: "freemium-limit",
			freemiumLimit: 5,
			freemiumLessonsViewed: 7,
		});
	});

	it("returns not-enrolled for paid course with no enrollment and no freemium", async () => {
		mockLimit.mockResolvedValueOnce([courseRow({ freemiumLimit: null })]);
		mockLimit.mockResolvedValueOnce([]);

		const { checkCourseAccess } = await import("../access.js");
		const result = await checkCourseAccess(userId, courseId);

		expect(result).toEqual({ allowed: false, reason: "not-enrolled" });
	});

	it("handles NaN freemiumLimit as not-enrolled", async () => {
		mockLimit.mockResolvedValueOnce([courseRow({ freemiumLimit: Number.NaN })]);
		mockLimit.mockResolvedValueOnce([]);

		const { checkCourseAccess } = await import("../access.js");
		const result = await checkCourseAccess(userId, courseId);

		expect(result).toEqual({ allowed: false, reason: "not-enrolled" });
	});
});
