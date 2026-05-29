import { env } from "$env/dynamic/private";
import { encodeLencoReference } from "./lenco";

interface LencoApiResponse {
	status: boolean;
	message: string;
	data: {
		id: string;
		initiatedAt: string;
		completedAt: string | null;
		amount: string;
		fee: string | null;
		bearer: "merchant" | "customer";
		currency: string;
		reference: string;
		lencoReference: string;
		type: "mobile-money";
		status: "pending" | "successful" | "failed" | "pay-offline";
		source: "api";
		reasonForFailure: string | null;
		settlementStatus: "pending" | "settled" | null;
		settlement: unknown;
		mobileMoneyDetails: unknown;
		bankAccountDetails: unknown;
		cardDetails: unknown;
	} | null;
}

function getApiConfig() {
	const isProduction =
		env.NODE_ENV === "production" && env.LENCO_ENV === "live";
	const baseUrl = isProduction
		? env.LENCO_BASE_URL || "https://api.lenco.co/access/v2"
		: env.LENCO_SANDBOX_URL || "https://api-sandbox.lenco.co/access/v2";
	const secretKey = isProduction
		? env.LENCO_SECRET_KEY
		: env.LENCO_SANDBOX_SECRET_KEY || env.LENCO_SECRET_KEY;

	return { baseUrl, secretKey, isProduction };
}

export function isLencoLive(): boolean {
	const { secretKey, isProduction } = getApiConfig();
	if (!secretKey) return false;
	return isProduction;
}

export { encodeLencoReference };

export async function initiateLencoMobileMoney(params: {
	amount: number;
	reference: string;
	phone: string;
	operator: string;
	country?: string;
	bearer?: "merchant" | "customer";
}): Promise<LencoApiResponse> {
	const { baseUrl, secretKey } = getApiConfig();
	if (!secretKey) throw new Error("Lenco API token is not configured");

	const res = await fetch(`${baseUrl}/collections/mobile-money`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${secretKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			amount: params.amount,
			reference: params.reference,
			phone: params.phone,
			operator: params.operator,
			country: params.country ?? "zm",
			bearer: params.bearer ?? "merchant",
		}),
	});

	const data: LencoApiResponse = await res.json();
	if (!res.ok || !data.status) {
		throw new Error(data.message || "Lenco API request failed");
	}
	return data;
}

export async function verifyLencoPayment(
	reference: string,
): Promise<LencoApiResponse> {
	const { baseUrl, secretKey } = getApiConfig();
	if (!secretKey) throw new Error("Lenco API token is not configured");

	const res = await fetch(`${baseUrl}/collections/status/${reference}`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${secretKey}`,
		},
	});

	const data: LencoApiResponse = await res.json();
	if (!res.ok || !data.status) {
		throw new Error(data.message || "Lenco payment verification failed");
	}
	return data;
}
