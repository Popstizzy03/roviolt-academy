import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import {
	user,
	payments,
	enrollments,
	userProgression,
} from "$lib/server/db/schema";
import {
	sendAccountDeletionConfirmation,
	sendAccountRestored,
	sendResetPasswordEmail,
	sendVerificationEmail,
	sendVideoReadyEmail,
	sendWelcomeEmail,
} from "$lib/server/email";
import { getInngest, sendInngestEvent } from "./client";

const inngest = getInngest();

export const processPaymentFulfillment = inngest.createFunction(
	{
		id: "payment-fulfillment",
		retries: 3,
		triggers: { event: "payment/process.fulfillment" },
	},
	async ({ event, step }) => {
		const { reference, userId, courseId, email } = event.data as {
			reference: string;
			userId: string;
			courseId: string;
			email?: string;
		};

		await step.run("update-payment-status", async () => {
			return await db
				.update(payments)
				.set({ status: "successful" })
				.where(eq(payments.gatewayReference, reference));
		});

		await step.run("upsert-enrollment", async () => {
			return await db
				.insert(enrollments)
				.values({
					id: `enr-${crypto.randomUUID()}`,
					userId,
					courseId,
					status: "active",
					freemiumLessonsViewed: 0,
				})
				.onConflictDoUpdate({
					target: [enrollments.userId, enrollments.courseId],
					set: { status: "active" },
				});
		});

		await step.run("init-progression", async () => {
			return await db
				.insert(userProgression)
				.values({
					userId,
					xp: 100,
					level: 1,
					currentStreak: 1,
					longestStreak: 1,
				})
				.onConflictDoNothing();
		});

		if (email) {
			await step.run("send-receipt", async () => {
				await sendInngestEvent("app/email.send", {
					type: "welcome",
					data: { email, name: "Student" },
				} as never);
			});
		}
	},
);

type EmailEventData =
	| {
			type: "verification";
			data: { email: string; url: string; token: string; name: string };
	  }
	| {
			type: "reset-password";
			data: { email: string; url: string; token: string; name: string };
	  }
	| { type: "account-deletion"; data: { email: string; name: string } }
	| { type: "account-restored"; data: { email: string; name: string } }
	| { type: "welcome"; data: { email: string; name: string } }
	| {
			type: "video-ready";
			data: { email: string; name: string; courseTitle: string };
	  };

export const sendEmail = inngest.createFunction(
	{ id: "send-email", triggers: [{ event: "app/email.send" }] },
	async ({ event, step }) => {
		const payload = event.data as
			| EmailEventData
			| { type?: string; data?: unknown };

		if (!payload?.type) {
			console.warn("Received sendEmail event without a valid type:", event);
			return;
		}

		const { type, data } = payload as EmailEventData;

		await step.run("send-to-resend", async () => {
			switch (type) {
				case "verification":
					return await sendVerificationEmail(data);
				case "reset-password":
					return await sendResetPasswordEmail(data);
				case "account-deletion":
					return await sendAccountDeletionConfirmation(data);
				case "account-restored":
					return await sendAccountRestored(data);
				case "welcome":
					return await sendWelcomeEmail(data);
				case "video-ready":
					return await sendVideoReadyEmail(data);
				default:
					throw new Error(`Unknown email type: ${type}`);
			}
		});
	},
);

export const delayedAccountDeletion = inngest.createFunction(
	{
		id: "delayed-account-deletion",
		cancelOn: [
			{
				event: "user/deletion.cancelled",
				match: "data.userId",
			},
		],
		triggers: { event: "user/deletion.requested" },
	},
	async ({ event, step }) => {
		const { userId } = event.data;

		await step.sleep("wait-for-grace-period", "30d");

		const [userData] = await step.run("verify-status", async () => {
			return await db.select().from(user).where(eq(user.id, userId)).limit(1);
		});

		if (userData && userData.deletionStatus === "pending_delete") {
			await step.run("hard-delete", async () => {
				return await auth.api.deleteUser({
					headers: new Headers(),
					body: { userId } as never,
				});
			});
		}
	},
);
