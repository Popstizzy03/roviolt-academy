import { eq } from "drizzle-orm";
import { auth } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { user } from "$lib/server/db/schema";
import { getInngest } from "./client";

const inngest = getInngest();

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
