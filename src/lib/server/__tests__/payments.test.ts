import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "$lib/server/db";

vi.mock("$lib/server/db", () => {
	const mockFindFirst = vi.fn();
	const mockWhere = vi.fn();
	const mockSet = vi.fn(() => ({ where: mockWhere }));
	const mockUpdate = vi.fn(() => ({ set: mockSet }));
	const mockOnConflictDoNothing = vi.fn();
	const mockValues = vi.fn(() => ({
		onConflictDoNothing: mockOnConflictDoNothing,
	}));
	const mockInsert = vi.fn(() => ({ values: mockValues }));

	return {
		db: {
			query: {
				payments: {
					findFirst: mockFindFirst,
				},
			},
			update: mockUpdate,
			insert: mockInsert,
		},
	};
});

vi.stubGlobal("crypto", {
	randomUUID: () => "test-uuid-1234",
});

describe("Payment Fulfillment", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("updates payment to succeeded and creates active enrollment", async () => {
		const { fulfillEnrollment } = await import(
			"$lib/server/payments/orchestrator"
		);
		const mockPayment = {
			id: "p1",
			userId: "u1",
			courseId: "c1",
			gateway: "lenco",
			gatewayReference: "ref_123",
			amount: "99.00",
			currency: "ZMW",
			status: "pending",
			metadata: {},
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-01"),
		};

		vi.mocked(db.query.payments.findFirst).mockResolvedValue(mockPayment);

		await fulfillEnrollment("ref_123");

		expect(db.query.payments.findFirst).toHaveBeenCalled();

		expect(db.update).toHaveBeenCalled();
		expect(db.insert).toHaveBeenCalled();
	});

	it("does nothing when payment is not found", async () => {
		const { fulfillEnrollment } = await import(
			"$lib/server/payments/orchestrator"
		);
		vi.mocked(db.query.payments.findFirst).mockResolvedValue(undefined);

		const mockUpdate = vi.mocked(db.update);
		const mockInsert = vi.mocked(db.insert);

		await fulfillEnrollment("unknown_ref");

		expect(mockUpdate).not.toHaveBeenCalled();
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it("does nothing when payment status is not pending", async () => {
		const { fulfillEnrollment } = await import(
			"$lib/server/payments/orchestrator"
		);
		vi.mocked(db.query.payments.findFirst).mockResolvedValue({
			id: "p2",
			userId: "u1",
			courseId: "c1",
			gateway: "lenco",
			gatewayReference: "ref_456",
			amount: "99.00",
			currency: "ZMW",
			status: "succeeded",
			metadata: {},
			createdAt: new Date("2024-01-01"),
			updatedAt: new Date("2024-01-01"),
		});

		const mockUpdate = vi.mocked(db.update);
		const mockInsert = vi.mocked(db.insert);

		await fulfillEnrollment("ref_456");

		expect(mockUpdate).not.toHaveBeenCalled();
		expect(mockInsert).not.toHaveBeenCalled();
	});
});
