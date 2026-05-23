<script lang="ts">
import { Separator as SeparatorPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

let {
	ref = $bindable(null),
	class: className,
	...restProps
}: SeparatorPrimitive.RootProps = $props();
</script>

<SeparatorPrimitive.Root
	bind:ref={ref}
	data-slot="select-separator"
	class={cn("bg-border -mx-1 h-px pointer-events-none", className)}
	{...restProps}
/>
