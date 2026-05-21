import { Inngest } from "inngest";

export const inngest = new Inngest({
	id: "roviolt-academy",
	isDev: process.env.INNGEST_DEV === "1",
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
