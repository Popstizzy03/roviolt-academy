<script lang="ts">
import type { PageData } from "./$types";
import { SquaresFourIcon } from "phosphor-svelte";
import LoginForm from "$lib/components/login-form.svelte";
import { Button } from "$lib/components/ui/button/index.js";
import * as Alert from "$lib/components/ui/alert/index.js";

let { data, form }: { data: PageData; form: import("./$types").ActionData } =
	$props();
</script>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-center gap-2 md:justify-start">
			<a href="/" class="flex items-center gap-2 font-medium">
				<div
					class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md"
				>
					<SquaresFourIcon class="size-4" />
				</div>
				Roviolt Academy.
			</a>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				{#if form?.restored}
					<Alert.Root>
						<Alert.Title>Account Restored</Alert.Title>
						<Alert.Description>
							Your account was scheduled for deletion.
							{#if form.daysLeft !== undefined && form.daysLeft > 0}
								It was due to be permanently deleted in {form.daysLeft} day(s)
								on {form.deletionDate}. Logging in has stopped the deletion and
								restored your account.
							{:else}
								Your account's 30-day grace period has ended. Logging in has
								restored your account.
							{/if}
						</Alert.Description>
					</Alert.Root>
					<div class="mt-6">
						<a href="/dashboard">
							<Button class="w-full">Continue to Dashboard</Button>
						</a>
					</div>
				{:else}
					<LoginForm />
					{#if data?.deleted}
						<p class="mt-4 text-center text-sm text-muted-foreground">
							Your account has been scheduled for deletion. You have 30 days to recover it by signing in.
						</p>
					{/if}
					{#if form?.message}
						<p class="mt-4 text-center text-sm text-destructive">{form.message}</p>
					{/if}
				{/if}
			</div>
		</div>
	</div>
	<div class="bg-muted relative hidden lg:block">
		<img
			src="/placeholder.svg"
			alt="placeholder"
			class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>
