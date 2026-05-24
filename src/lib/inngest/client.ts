import { Inngest } from "inngest";
import { env } from "$env/dynamic/private";

let _inngest: Inngest | null = null;

export function getInngest() {
	if (!_inngest) {
		_inngest = new Inngest({
			id: "roviolt-academy",
			isDev: env.INNGEST_DEV === "1",
		});
	}
	return _inngest;
}

export async function sendInngestEvent(
	name: string,
	data: Record<string, unknown>,
) {
	const isDev = env.INNGEST_DEV === "1";
	const eventKey = env.INNGEST_EVENT_KEY;

	// In development, the SDK handles local redirection if isDev is true.
	// In production, we require an event key.
	if (!isDev && (!eventKey || eventKey === "local")) return;

	try {
		return await getInngest().send({ name, data });
	} catch (err) {
		console.error("Inngest send error:", err);
	}
}
