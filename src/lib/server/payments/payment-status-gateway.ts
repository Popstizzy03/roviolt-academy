type PaymentStatusPayload =
	| { event: "payment.completed"; reference: string }
	| { event: "payment.failed"; reference: string; reason?: string }
	| { event: "payment.cancelled"; reference: string };

class PaymentStatusGateway {
	private subjects = new Map<
		string,
		Set<(payload: PaymentStatusPayload) => void>
	>();

	getListeners(
		reference: string,
	): Set<(payload: PaymentStatusPayload) => void> {
		if (!this.subjects.has(reference)) {
			this.subjects.set(reference, new Set());
		}
		return this.subjects.get(reference) as Set<
			(payload: PaymentStatusPayload) => void
		>;
	}

	subscribe(
		reference: string,
		listener: (payload: PaymentStatusPayload) => void,
	): () => void {
		const listeners = this.getListeners(reference);
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
			if (listeners.size === 0) {
				this.subjects.delete(reference);
			}
		};
	}

	emit(reference: string, payload: PaymentStatusPayload) {
		const listeners = this.subjects.get(reference);
		if (listeners && listeners.size > 0) {
			for (const listener of listeners) {
				listener(payload);
			}
			if (
				payload.event === "payment.completed" ||
				payload.event === "payment.failed" ||
				payload.event === "payment.cancelled"
			) {
				this.subjects.delete(reference);
			}
		}
	}
}

export const paymentStatusGateway = new PaymentStatusGateway();
