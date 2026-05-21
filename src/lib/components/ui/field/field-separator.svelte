<script lang="ts">
import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";
import type { WithElementRef } from "$lib/utils.js";

let {
	ref = $bindable(null),
	class: className,
	children,
	...restProps
}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
	children?: Snippet;
} = $props();

const _hasContent = $derived(!!children);
</script>

<div
	bind:this={ref}
	data-slot="field-separator"
	data-content={hasContent}
	class={cn("-my-2 h-5 text-xs group-data-[variant=outline]/field-group:-mb-2 relative", className)}
	{...restProps}
>
	<Separator class="absolute inset-0 top-1/2" />
	{#if children}
		<span
			class="text-muted-foreground px-2 bg-background relative mx-auto block w-fit"
			data-slot="field-separator-content"
		>
			{@render children()}
		</span>
	{/if}
</div>
