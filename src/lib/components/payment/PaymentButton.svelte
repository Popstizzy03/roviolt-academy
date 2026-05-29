<script lang="ts">
import { PUBLIC_LENCO_PUBLIC_KEY } from "$env/static/public";
import {
	initiatePayment,
	verifyPayment,
	abandonPayment,
	markWidgetOpened,
} from "$lib/api/payment";
import LencoScriptLoader from "./LencoScriptLoader.svelte";

interface Props {
	courseId: string;
	amount: number;
	currency?: string;
	email: string;
	userName?: string;
	userPhone?: string;
	isEnrolled?: boolean;
	onEnrolled?: () => void;
}

let {
	courseId,
	amount,
	currency = "ZMW",
	email,
	userName,
	userPhone,
	isEnrolled = false,
	onEnrolled,
}: Props = $props();

type PayState =
	| "idle"
	| "initiating"
	| "widget_open"
	| "verifying"
	| "awaiting_mobile"
	| "enrolled";

let payState = $state<PayState>("idle");
let gatewayReady = $state(false);
let currentReference: string | null = $state(null);
let sseSource: EventSource | null = null;
let mobileMoneyTimeout: ReturnType<typeof setTimeout> | null = null;

const isIdle = $derived(payState === "idle");
const isDisabled = $derived(!gatewayReady || !isIdle || isEnrolled);

const buttonLabel = $derived.by(() => {
	if (isEnrolled) return "Go to Course";
	switch (payState) {
		case "initiating":
			return "Preparing payment\u2026";
		case "widget_open":
			return "Complete in popup\u2026";
		case "verifying":
			return "Verifying\u2026";
		case "awaiting_mobile":
			return "Waiting for mobile confirmation\u2026";
		case "enrolled":
			return "Enrolled \u2713";
		default:
			return gatewayReady
				? `Enroll Now (${currency} ${amount})`
				: "Loading gateway\u2026";
	}
});

const isSpinning = $derived(payState !== "idle" && payState !== "enrolled");

async function handleBuy() {
	if (isEnrolled || payState === "enrolled") {
		onEnrolled?.();
		return;
	}
	if (payState !== "idle" || !gatewayReady) return;

	payState = "initiating";

	try {
		const config = await initiatePayment({
			courseId,
			amount,
			currency,
		});

		currentReference = config.reference;
		payState = "widget_open";

		await markWidgetOpened(config.reference);

		if (!window.LencoPay) {
			throw new Error("Payment gateway not available");
		}

		window.LencoPay.getPaid({
			key: PUBLIC_LENCO_PUBLIC_KEY,
			reference: config.reference,
			amount: config.amount,
			currency: config.currency,
			email,
			label: "Course Enrollment",
			bearer: "merchant",
			channels: ["card", "mobile-money"],
			customer: {
				firstName: userName ?? undefined,
				phone: userPhone ?? undefined,
			},
			onSuccess: async () => {
				payState = "verifying";
				await verifyOnce(config.reference);
			},
			onConfirmationPending: () => {
				payState = "awaiting_mobile";
				startSSE(config.reference);
			},
			onClose: () => {
				if (payState === "widget_open" || payState === "awaiting_mobile") {
					const closedFrom = payState;
					payState = "idle";
					safeCancel(config.reference, `user_closed_from_${closedFrom}`);
				}
			},
		});
	} catch (e) {
		console.error("Payment initiation failed:", e);
		if (currentReference) {
			safeCancel(currentReference, "initiation_error");
		}
		payState = "idle";
		currentReference = null;
	}
}

async function verifyOnce(ref: string, attempt = 0) {
	try {
		const result = await verifyPayment(ref);

		if (result.status === "successful" || result.status === "completed") {
			handleEnrolled();
			return;
		}

		if (result.status === "pending" || result.status === "pay-offline") {
			startSSE(ref);
			return;
		}

		payState = "idle";
		currentReference = null;
	} catch {
		if (attempt < 3) {
			setTimeout(() => verifyOnce(ref, attempt + 1), 2000);
		} else {
			startSSE(ref);
		}
	}
}

function startSSE(ref: string) {
	closeSSE();
	sseSource = new EventSource(`/api/payments/stream/${ref}`, {
		withCredentials: true,
	});

	sseSource.addEventListener("payment.completed", () => {
		handleEnrolled();
		closeSSE();
	});

	sseSource.addEventListener("payment.failed", (e) => {
		const data = JSON.parse((e as MessageEvent).data);
		console.warn("Payment failed:", data);
		payState = "idle";
		currentReference = null;
		closeSSE();
	});

	sseSource.addEventListener("payment.cancelled", () => {
		payState = "idle";
		currentReference = null;
		closeSSE();
	});

	sseSource.onerror = () => {
		closeSSE();
		if (
			(payState === "verifying" || payState === "awaiting_mobile") &&
			currentReference
		) {
			verifyOnce(currentReference, 2);
		}
	};

	mobileMoneyTimeout = setTimeout(
		() => {
			closeSSE();
			if (payState === "awaiting_mobile") {
				payState = "idle";
				currentReference = null;
			}
		},
		10 * 60 * 1000,
	);
}

function handleEnrolled() {
	payState = "enrolled";
	currentReference = null;
	onEnrolled?.();
}

function closeSSE() {
	sseSource?.close();
	sseSource = null;
	if (mobileMoneyTimeout) {
		clearTimeout(mobileMoneyTimeout);
		mobileMoneyTimeout = null;
	}
}

async function safeCancel(ref: string, reason: string) {
	try {
		await abandonPayment(ref, reason);
	} catch {
		/* ignore */
	}
}
</script>

<LencoScriptLoader
	onloaded={() => (gatewayReady = true)}
	onerror={() => (gatewayReady = false)}
/>

<button onclick={handleBuy} disabled={isDisabled} class="btn btn-primary w-full">
	{#if isSpinning}
		<svg class="mr-2 inline h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
	{/if}
	{buttonLabel}
</button>
