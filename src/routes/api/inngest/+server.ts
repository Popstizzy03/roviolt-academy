import { serve } from "inngest/sveltekit";
import { getInngest } from "$lib/inngest/client";
import { delayedAccountDeletion, sendEmail } from "$lib/inngest/functions";

export const { GET, POST, PUT } = serve({
	client: getInngest(),
	functions: [delayedAccountDeletion, sendEmail],
});
