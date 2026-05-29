import { error } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { paymentStatusGateway } from "$lib/server/payments/payment-status-gateway";

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, "Authentication required");

	const { reference } = params;
	if (!reference) throw error(400, "Reference is required");

	const stream = new ReadableStream({
		start(controller) {
			controller.enqueue(
				`event: connected\ndata: ${JSON.stringify({ reference })}\n\n`,
			);

			const unsubscribe = paymentStatusGateway.subscribe(
				reference,
				(payload) => {
					const data = JSON.stringify(payload);
					controller.enqueue(`event: ${payload.event}\ndata: ${data}\n\n`);
					if (
						payload.event === "payment.completed" ||
						payload.event === "payment.failed" ||
						payload.event === "payment.cancelled"
					) {
						controller.close();
					}
				},
			);

			// Keep-alive ping every 15s
			const keepAlive = setInterval(() => {
				try {
					controller.enqueue(": keepalive\n\n");
				} catch {
					clearInterval(keepAlive);
				}
			}, 15_000);

			// Cleanup on client disconnect
			const cleanup = () => {
				clearInterval(keepAlive);
				unsubscribe();
			};

			const ctrl = controller as ReadableStreamDefaultController & {
				signal?: AbortSignal;
			};
			if (ctrl.signal) {
				ctrl.signal.addEventListener("abort", cleanup);
			}
		},
		cancel() {
			/* cleanup handled by start */
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
