<script lang="ts">
import type { Drawer as DrawerPrimitive } from "vaul-svelte";

let {
	ref = $bindable(null),
	class: className,
	...restProps
}: DrawerPrimitive.TitleProps = $props();
</script>

<DrawerPrimitive.Title
	bind:ref
	data-slot="drawer-title"
	class={cn("text-foreground text-sm font-medium", className)}
	{...restProps}
/>
