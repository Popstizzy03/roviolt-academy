import type {
	PaymentInitiationResponse,
	PaymentVerificationResponse,
	InitiatePaymentDto,
} from "$lib/types/payment";

const BASE = "/api/payments";

export async function initiatePayment(
	data: InitiatePaymentDto,
	fetchFn: typeof fetch = fetch,
): Promise<PaymentInitiationResponse> {
	const res = await fetchFn(`${BASE}/initiate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		const err = await res.json().catch(() => ({ message: "Request failed" }));
		throw new Error(err.message || "Failed to initiate payment");
	}
	return res.json();
}

export async function verifyPayment(
	reference: string,
	fetchFn: typeof fetch = fetch,
): Promise<PaymentVerificationResponse> {
	const res = await fetchFn(`${BASE}/verify/${reference}`);
	if (!res.ok) {
		const err = await res
			.json()
			.catch(() => ({ message: "Verification failed" }));
		throw new Error(err.message || "Payment verification failed");
	}
	return res.json();
}

export async function cancelPaymentByReference(
	reference: string,
	fetchFn: typeof fetch = fetch,
): Promise<void> {
	await fetchFn(`${BASE}/cancel-by-reference/${reference}`, { method: "POST" });
}

export async function abandonPayment(
	reference: string,
	reason: string,
	fetchFn: typeof fetch = fetch,
): Promise<void> {
	try {
		await fetchFn(`${BASE}/abandon`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ reference, reason }),
		});
	} catch {
		/* fire-and-forget */
	}
}

export async function markWidgetOpened(
	reference: string,
	fetchFn: typeof fetch = fetch,
): Promise<void> {
	try {
		await fetchFn(`${BASE}/widget-opened`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ reference }),
		});
	} catch {
		/* non-critical */
	}
}
