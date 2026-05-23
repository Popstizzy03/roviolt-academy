<script lang="ts">
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { resolve } from "$app/paths";

let navigating = $state(false);
</script>

<div class="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center px-4 py-12 text-center">
	<div class="mb-6 flex size-16 items-center justify-center rounded-full bg-green-100">
		<svg xmlns="http://www.w3.org/2000/svg" class="size-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M20 6L9 17l-5-5"/>
		</svg>
	</div>
	<h1 class="text-3xl font-bold">Welcome aboard!</h1>
	<p class="mt-3 text-muted-foreground">
		Your profile is complete. You're ready to start learning.
	</p>
	<a href={resolve("/dashboard")} onclick={() => navigating = true}>
		<Button class="mt-8" disabled={navigating}>
			{#if navigating}<Spinner />{/if}
			Go to Dashboard
		</Button>
	</a>
</div>
