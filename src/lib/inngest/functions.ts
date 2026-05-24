import { eq } from "drizzle-orm";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import {
	sendAccountDeletionConfirmation,
	sendAccountRestored,
	sendResetPasswordEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "$lib/server/email";
import { getInngest } from "./client";

const inngest = getInngest();

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
	| { type: "welcome"; data: { email: string; name: string } };

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
