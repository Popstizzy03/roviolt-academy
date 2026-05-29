<script lang="ts">
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";
import type { PageData } from "./$types";
import { Button } from "$lib/components/ui/button/index.js";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "$lib/components/ui/card/index.js";
import PaymentButton from "$lib/components/payment/PaymentButton.svelte";

let { data }: { data: PageData } = $props();

const priceUsd = $derived(`$${(data.course.price / 100).toFixed(2)}`);
const priceZmw = $derived(
	data.course.priceZmw ? `K${data.course.priceZmw.toLocaleString()}` : null,
);

function handleEnrolled() {
	goto(resolve(`/learn/${data.course.id}`));
}
</script>

<div class="mx-auto max-w-2xl px-4 py-12">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-zinc-100">Checkout</h1>
		<p class="mt-1 text-zinc-400">{data.course.title}</p>
	</div>

	<div class="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
		<div class="flex items-center gap-4">
			{#if data.course.thumbnail}
				<img
					src={data.course.thumbnail}
					alt=""
					class="h-16 w-24 rounded-lg object-cover"
				/>
			{/if}
			<div>
				<h2 class="font-semibold text-zinc-200">{data.course.title}</h2>
				{#if data.course.instructorName}
					<p class="text-sm text-zinc-500">by {data.course.instructorName}</p>
				{/if}
			</div>
		</div>
		<div class="mt-3 flex items-baseline gap-3 border-t border-zinc-800 pt-3">
			<span class="text-xl font-bold text-zinc-100">{priceUsd}</span>
			{#if priceZmw}
				<span class="text-sm text-zinc-500">/ {priceZmw}</span>
			{/if}
		</div>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Payment Method</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-3">
				{#if data.course.priceZmw}
					<div class="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
						<div>
							<span class="font-medium text-zinc-200"
								>Lenco — Mobile Money (ZMW)</span
							>
							<p class="text-sm text-zinc-500">
								Pay with Airtel Money, MTN Mobile Money
							</p>
						</div>
						<span class="ml-auto text-sm font-semibold text-zinc-200">{priceZmw}</span>
					</div>

					<PaymentButton
						courseId={data.course.id}
						amount={data.course.priceZmw}
						currency="ZMW"
						email={data.userEmail}
						userName={data.userName}
						isEnrolled={data.isEnrolled}
						onEnrolled={handleEnrolled}
					/>
				{/if}

				<div class="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-700 bg-zinc-900/60 p-4">
					<div>
						<span class="font-medium text-zinc-200"
							>Dodo Payments — Card / International (USD)</span
						>
						<p class="text-sm text-zinc-500">
							Pay with credit/debit card, PayPal
						</p>
					</div>
					<span class="ml-auto text-sm font-semibold text-zinc-200">{priceUsd}</span>
				</div>
			</div>
		</CardContent>
	</Card>

	<div class="mt-6 flex items-center justify-end gap-4">
		<Button
			href={resolve(`/courses/${data.course.slug}`)}
			variant="ghost"
			class="text-sm"
		>
			Cancel
		</Button>
	</div>
</div>
