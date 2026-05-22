<script lang="ts">
import { cn } from "$lib/utils.js";
import { Separator as SeparatorPrimitive } from "bits-ui";

let {
	ref = $bindable(null),
	class: className,
	...restProps
}: SeparatorPrimitive.RootProps = $props();
</script>

<SeparatorPrimitive.Root
	bind:this={ref}
	data-slot="select-separator"
	class={cn("bg-border -mx-1 h-px pointer-events-none", className)}
	{...restProps}
/>
