import { Inngest } from "inngest";

let _inngest: Inngest | null = null;

function getInngest() {
	if (!_inngest) {
		_inngest = new Inngest({
			id: "roviolt-academy",
			isDev: process.env.INNGEST_DEV === "1",
		});
	}
	return _inngest;
}

export async function sendInngestEvent(
	name: string,
	data: Record<string, unknown>,
) {
	const eventKey = process.env.INNGEST_EVENT_KEY;
	if (!eventKey || eventKey === "local") return;
	try {
		return await getInngest().send({ name, data });
	} catch {
		// Silently ignore — Inngest not configured
	}
}
