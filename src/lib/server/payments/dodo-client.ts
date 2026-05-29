import type { RequestEvent } from "@sveltejs/kit";

interface ProductCartItem {
	product_id: string;
	quantity: number;
	amount?: number;
}

interface CustomerInfo {
	email: string;
	name?: string;
}

interface DodoCheckoutSessionRequest {
	product_cart: ProductCartItem[];
	customer: CustomerInfo;
	return_url: string;
	metadata?: Record<string, string>;
}

interface DodoCheckoutSessionResponse {
	session_id: string;
	checkout_url: string | null;
	payment_id?: string;
	client_secret?: string;
	publishable_key?: string;
}

function getBaseUrl(): string {
	const apiKey = process.env.DODO_API_KEY;
	if (!apiKey) return "https://test.dodopayments.com";
	return apiKey.startsWith("test_")
		? "https://test.dodopayments.com"
		: "https://live.dodopayments.com";
}

function getApiKey(): string | undefined {
	return process.env.DODO_API_KEY;
}

export function isDodoLive(): boolean {
	const key = getApiKey();
	if (!key) return false;
	// Dodo live keys start with "live_" or "sk_live_"
	if (key.startsWith("live_") || key.startsWith("sk_live_")) return true;
	return false;
}

export async function createDodoCheckoutSession(
	params: DodoCheckoutSessionRequest,
	event: RequestEvent,
): Promise<DodoCheckoutSessionResponse> {
	const apiKey = getApiKey();
	if (!apiKey) {
		throw new Error("DODO_API_KEY is not configured");
	}

	const baseUrl = getBaseUrl();
	const url = `${baseUrl}/checkouts`;

	const response = await event.fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			product_cart: params.product_cart,
			customer: params.customer,
			return_url: params.return_url,
			metadata: params.metadata,
		}),
	});

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Dodo API error (${response.status}): ${body}`);
	}

	const data: DodoCheckoutSessionResponse = await response.json();
	return data;
}
