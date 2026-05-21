import { Inngest } from "inngest";
import { INNGEST_DEV } from "$env/static/private";

export const inngest = new Inngest({
	id: "roviolt-academy",
	isDev: INNGEST_DEV === "1",
});

export async function sendInngestEvent(
	name: string,
	data: Record<string, unknown>,
) {
	const eventKey = process.env.INNGEST_EVENT_KEY;
	if (!eventKey || eventKey === "local") return;
	try {
		return await inngest.send({ name, data });
	} catch {
		// Silently ignore — Inngest not configured
	}
}
