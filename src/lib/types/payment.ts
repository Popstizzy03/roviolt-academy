export interface PaymentInitiationResponse {
	success: boolean;
	reference: string;
	amount: number;
	currency: string;
}

export interface PaymentVerificationResponse {
	success: boolean;
	status: string;
	amount: number;
	currency: string;
	paymentMethod?: string;
	transactionId?: string;
	lencoReference?: string;
	fee?: number;
	processedAt?: string;
	enrolled?: boolean;
}

export interface InitiatePaymentDto {
	courseId: string;
	userId?: string;
	amount: number;
	currency?: string;
	email?: string;
	customer?: {
		firstName?: string;
		lastName?: string;
		phone?: string;
	};
	billing?: {
		country?: string;
	};
}

export interface LencoConfig {
	key: string;
	reference: string;
	amount: number;
	currency: string;
	email?: string;
	label?: string;
	bearer?: "merchant" | "customer";
	channels?: string[];
	onSuccess: (response: { reference: string; status: string }) => void;
	onClose: () => void;
	onConfirmationPending: () => void;
	customer?: {
		firstName?: string;
		lastName?: string;
		phone?: string;
	};
}

export interface LencoPayInstance {
	getPaid: (options: LencoConfig) => void;
}

declare global {
	interface Window {
		LencoPay?: LencoPayInstance;
	}
}
