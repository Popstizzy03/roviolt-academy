import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { Sandbox } from "e2b";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session) {
		throw error(401, "Authentication required");
	}

	const { code, language } = (await request.json()) as {
		code: string;
		language?: string;
	};
	const lang = language || "python";
	const filename =
		lang === "js" || lang === "javascript" ? "index.js" : "main.py";

	const stream = new ReadableStream({
		async start(controller) {
			const encoder = new TextEncoder();
			const sendEvent = (event: string, data: unknown) => {
				controller.enqueue(
					encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
				);
			};

			try {
				sendEvent("status", { message: "Provisioning sandbox..." });

				const box = await Sandbox.create({
					template: lang,
					apiKey: env.E2B_API_KEY,
				});

				sendEvent("status", { message: "Writing code..." });
				await box.files.write(filename, code);

				sendEvent("status", { message: "Running..." });
				const cmd = lang === "js" ? `node ${filename}` : `python3 ${filename}`;

				const result = await box.commands.run(cmd, {
					onStdout: (data: string) => sendEvent("stdout", { output: data }),
					onStderr: (data: string) => sendEvent("stderr", { output: data }),
					timeoutMs: 10_000,
				});

				if (result.exitCode === 0) {
					sendEvent("status", { message: "Execution complete." });
				} else {
					sendEvent("error", {
						message:
							result.stderr || `Process exited with code ${result.exitCode}`,
					});
				}

				if (box.sandboxId) {
					Sandbox.kill(box.sandboxId, { apiKey: env.E2B_API_KEY }).catch(
						() => {},
					);
				}

				controller.close();
			} catch (err: unknown) {
				const message =
					err instanceof Error ? err.message : "Unknown execution error";
				sendEvent("error", { message });
				controller.close();
			}
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
};
