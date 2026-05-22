<script lang="ts">
import { SquaresFourIcon } from "phosphor-svelte";
import SignupForm from "$lib/components/signup-form.svelte";
import type { ActionData } from "./$types";

let { form }: { form: ActionData } = $props();
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
				{#if form?.success}
					<div class="text-center">
						<h2 class="text-xl font-bold text-green-600">Account created!</h2>
						<p class="mt-2 text-sm text-muted-foreground">{form.message}</p>
					</div>
				{:else}
					<SignupForm />
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
			alt=""
			class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
		/>
	</div>
</div>
