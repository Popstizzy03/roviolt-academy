<script lang="ts">
import { cn } from "$lib/utils.js";
import type { HTMLAttributes } from "svelte/elements";
import type { WithElementRef } from "$lib/utils.js";

let {
	ref = $bindable(null),
	class: className,
	children,
	variant = "default",
	...restProps
}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
	variant?: "default" | "destructive";
} = $props();
</script>

<div
	bind:this={ref}
	data-slot="alert"
	data-variant={variant}
	class={cn(
		"ring-foreground/10 bg-card text-card-foreground gap-2 rounded-none border-l-4 px-4 py-3 text-xs/relaxed ring-1 data-[variant=destructive]:border-destructive data-[variant=destructive]:ring-destructive/20 dark:data-[variant=destructive]:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 data-[variant=destructive]:text-destructive [&_svg:not([class*='size-'])]:size-4 relative w-full",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
