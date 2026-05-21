<script lang="ts">
import SquaresFourIcon from "phosphor-svelte/lib/SquaresFour";
import LoginForm from "$lib/components/login-form.svelte";
import type { PageData } from "./$types";

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
				<LoginForm />
				{#if data?.deleted}
					<p class="mt-4 text-center text-sm text-muted-foreground">
						Your account has been scheduled for deletion. You have 30 days to recover it by signing in.
					</p>
				{/if}
				{#if form?.message}
					<p class="mt-4 text-center text-sm text-destructive">{form.message}</p>
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
