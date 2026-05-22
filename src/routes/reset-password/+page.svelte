<script lang="ts">
import { SquaresFourIcon } from "phosphor-svelte";
import * as Card from "$lib/components/ui/card/index.js";
import * as Field from "$lib/components/ui/field/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { cn } from "$lib/utils.js";
import { enhance } from "$app/forms";
import type { ActionData, PageData } from "./$types";

let { data, form }: { data: PageData; form: ActionData } = $props();

let submitting = $state(false);
</script>

<div class="mx-auto flex min-h-svh max-w-sm flex-col items-center justify-center px-4">
	<a href="/" class="mb-8 flex items-center gap-2 font-medium">
		<div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
			<SquaresFourIcon class="size-4" />
		</div>
		Roviolt Academy.
	</a>
	<Card.Root class="w-full">
		<Card.Header>
			<Card.Title>Reset your password</Card.Title>
			<Card.Description>
				Enter your new password below.
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						submitting = false;
						update();
					};
				}}
			>
				<input type="hidden" name="token" value={data.token} />
				<Field.Field>
					<Field.Label for="newPassword">New password</Field.Label>
					<Input id="newPassword" name="newPassword" type="password" required minlength={8} placeholder="Min. 8 characters" />
				</Field.Field>
				<Field.Field>
					<Field.Label for="confirmPassword">Confirm password</Field.Label>
					<Input id="confirmPassword" name="confirmPassword" type="password" required minlength={8} placeholder="Repeat password" />
				</Field.Field>
				<Button type="submit" class="mt-4 w-full" disabled={submitting}>
					{#if submitting}<Spinner />{/if}
					Reset password
				</Button>
			</form>
			{#if form?.message}
				<p class="mt-4 text-center text-sm text-destructive">{form.message}</p>
			{/if}
			<p class="mt-4 text-center text-sm text-muted-foreground">
				<a href="/signin" class="underline underline-offset-4">Back to sign in</a>
			</p>
		</Card.Content>
	</Card.Root>
</div>