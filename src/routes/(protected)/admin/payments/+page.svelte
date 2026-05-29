<script lang="ts">
import { enhance } from "$app/forms";
import type { PageData } from "./$types";
import { Button } from "$lib/components/ui/button/index.js";

let { data }: { data: PageData } = $props();

let approvingId = $state<string | null>(null);
let successMessage = $state("");
let errorMessage = $state("");

function handleApprove(id: string) {
	approvingId = id;
	successMessage = "";
	errorMessage = "";
}
</script>

<div class="mx-auto max-w-5xl px-4 py-8">
	<h1 class="mb-2 text-3xl font-bold text-zinc-100">Payments</h1>
	<p class="mb-8 text-zinc-400">Manage all payments across the platform.</p>

	{#if successMessage}
		<div class="mb-4 rounded-lg border border-emerald-800 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-400">
			{successMessage}
		</div>
	{/if}

	{#if errorMessage}
		<div class="mb-4 rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-sm text-red-400">
			{errorMessage}
		</div>
	{/if}

	<div class="overflow-x-auto rounded-xl border border-zinc-800">
		<table class="w-full text-left text-sm">
			<thead>
				<tr class="border-b border-zinc-800 bg-zinc-950/60">
					<th class="px-4 py-3 font-medium text-zinc-400">User</th>
					<th class="px-4 py-3 font-medium text-zinc-400">Course</th>
					<th class="px-4 py-3 font-medium text-zinc-400">Gateway</th>
					<th class="px-4 py-3 font-medium text-zinc-400">Amount</th>
					<th class="px-4 py-3 font-medium text-zinc-400">Status</th>
					<th class="px-4 py-3 font-medium text-zinc-400">Date</th>
					<th class="px-4 py-3 font-medium text-zinc-400">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.payments as payment (payment.id)}
					<tr class="border-b border-zinc-800 last:border-0 hover:bg-zinc-900/40">
						<td class="px-4 py-3 text-zinc-200">
							<div>{payment.userName || "—"}</div>
							<div class="text-xs text-zinc-500">{payment.userEmail || "—"}</div>
						</td>
						<td class="px-4 py-3 text-zinc-200">
							{payment.courseTitle || "—"}
						</td>
						<td class="px-4 py-3">
							<span class="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium uppercase text-zinc-300">
								{payment.gateway}
							</span>
						</td>
						<td class="px-4 py-3 text-zinc-200">
							{payment.currency} {payment.amount}
						</td>
						<td class="px-4 py-3">
							{#if payment.status === "pending"}
								<span class="rounded bg-amber-950/40 px-2 py-0.5 text-xs font-medium text-amber-400">
									Pending
								</span>
							{:else if payment.status === "succeeded"}
								<span class="rounded bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-400">
									Succeeded
								</span>
							{:else}
								<span class="rounded bg-red-950/40 px-2 py-0.5 text-xs font-medium text-red-400">
									{payment.status}
								</span>
							{/if}
						</td>
						<td class="px-4 py-3 text-xs text-zinc-500">
							{new Date(payment.createdAt).toLocaleDateString()}
						</td>
						<td class="px-4 py-3">
							{#if payment.status === "pending"}
								<form method="POST" action="?/approve" use:enhance={() => {
									successMessage = "";
									errorMessage = "";
									return async ({ result }) => {
										approvingId = null;
										if (result.type === "success") {
											successMessage = "Payment approved successfully";
										} else if (result.type === "failure") {
											const data = result.data as { message?: string };
											errorMessage = data?.message || "Failed to approve";
										}
									};
								}}>
									<input type="hidden" name="paymentId" value={payment.id} />
									<Button
										type="submit"
										size="sm"
										variant="outline"
										onclick={() => handleApprove(payment.id)}
										disabled={approvingId === payment.id}
									>
										{approvingId === payment.id ? "Approving..." : "Approve"}
									</Button>
								</form>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>

		{#if data.payments.length === 0}
			<div class="px-4 py-12 text-center text-sm text-zinc-500">
				No payments found.
			</div>
		{/if}
	</div>
</div>
