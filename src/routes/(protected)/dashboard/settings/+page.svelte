<script lang="ts">
import { enhance } from "$app/forms";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import type { ActionData } from "./$types";

let {
	form,
}: {
	form: ActionData & {
		link?: { href: string; text: string };
		messageAfter?: string;
		errors?: {
			password?: string[];
			confirmDelete?: string[];
		};
	};
} = $props();

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

	{#if form?.message || form?.errors}
		<div class="border border-red-300 bg-red-50 p-4">
			{#if form?.message}
				<p class="text-sm text-red-700">
					{form.message}
					{#if form?.link}
						<a href={form.link.href} class="underline">{form.link.text}</a>
					{/if}
					{form?.messageAfter}
				</p>
			{/if}
			{#if form?.errors}
				<ul class="list-disc list-inside text-sm text-red-700">
				{#each Object.entries(form.errors) as [fieldName, fieldErrors] (fieldName)}
					{#each fieldErrors as error, i (i)}
						<li>{error}</li>
					{/each}
				{/each}
				</ul>
			{/if}
		</div>
	{/if}

	<div class="border border-red-200 p-6">
		<h2 class="text-lg font-semibold text-red-700">Danger Zone</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			Once you delete your account, there is a 30-day grace period during which you can recover it
			by signing in. After 30 days, your account will be permanently deleted.
		</p>

		<form method="POST" action="?/deleteAccount" use:enhance={handleEnhance} class="mt-4 space-y-4">
			<div>
				<Input
					type="password"
					name="password"
					autocomplete="current-password"
					placeholder="Enter your password to confirm"
					bind:value={deletePassword}
					required
					class={form?.errors?.password ? "border-destructive" : ""}
				/>
				{#if form?.errors?.password}
					<p class="mt-1 text-xs text-destructive">{form.errors.password[0]}</p>
				{/if}
			</div>

			<div>
				<label class="flex items-start gap-3">
					<input 
						type="checkbox" 
						name="confirmDelete" 
						value="true"
						bind:checked={confirmDelete} 
						required 
					/>
					<span class="text-sm">
						I understand that my account will be permanently deleted after 30 days.
					</span>
				</label>
				{#if form?.errors?.confirmDelete}
					<p class="mt-1 text-xs text-destructive">{form.errors.confirmDelete[0]}</p>
				{/if}
			</div>

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
