<script lang="ts">
import { enhance } from "$app/forms";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import type { ActionData } from "./$types";

let { form }: { form: ActionData } = $props();

let submitting = $state<string | null>(null);
let confirmDelete = $state(false);
let deletePassword = $state("");

function handleEnhance({ submitter }: { submitter: HTMLElement | null }) {
	let key = (submitter as HTMLButtonElement | null)?.value || "deleteAccount";
	submitting = key;
	return async ({ update }: { update: () => void }) => {
		submitting = null;
		update();
	};
}
</script>

<div class="mx-auto max-w-2xl space-y-8 p-6">
	<h1 class="text-2xl font-bold">Settings</h1>

	{#if form?.message}
		<div class="border border-red-300 bg-red-50 p-4">
			<p class="text-sm text-red-700">{form.message}</p>
		</div>
	{/if}

	<div class="border border-red-200 p-6">
		<h2 class="text-lg font-semibold text-red-700">Danger Zone</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			Once you delete your account, there is a 30-day grace period during which you can recover it
			by signing in. After 30 days, your account will be permanently deleted.
		</p>

		<form method="POST" action="?/deleteAccount" use:enhance={handleEnhance} class="mt-4 space-y-4">
			<Input
				type="password"
				name="password"
				placeholder="Enter your password to confirm"
				bind:value={deletePassword}
				required
			/>
			<label class="flex items-start gap-3">
				<input type="checkbox" bind:checked={confirmDelete} required />
				<span class="text-sm">
					I understand that my account will be permanently deleted after 30 days.
				</span>
			</label>
			<Button
				variant="destructive"
				type="submit"
				disabled={submitting !== null || !confirmDelete || !deletePassword}
			>
				{#if submitting === "deleteAccount"}<Spinner />{/if}
				Delete Account
			</Button>
		</form>
	</div>
</div>
