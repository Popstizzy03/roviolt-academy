<script lang="ts">
import { Drawer as DrawerPrimitive } from "vaul-svelte";

let { ref = $bindable(null), ...restProps }: DrawerPrimitive.CloseProps =
	$props();
</script>

<DrawerPrimitive.Close bind:this={ref} data-slot="drawer-close" {...restProps} />
