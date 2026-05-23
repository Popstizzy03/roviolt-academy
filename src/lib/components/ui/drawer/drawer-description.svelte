<script lang="ts">
import { cn } from "$lib/utils.js";
import { Drawer as DrawerPrimitive } from "vaul-svelte";

let {
	ref = $bindable(null),
	class: className,
	...restProps
}: DrawerPrimitive.DescriptionProps = $props();
</script>

<DrawerPrimitive.Description
	bind:ref={ref}
	data-slot="drawer-description"
	class={cn("text-muted-foreground text-xs/relaxed", className)}
	{...restProps}
/>
