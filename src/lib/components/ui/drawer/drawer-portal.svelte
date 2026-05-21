<script lang="ts">
import type { Drawer as DrawerPrimitive } from "vaul-svelte";

let { ...restProps }: DrawerPrimitive.PortalProps = $props();
</script>

<DrawerPrimitive.Portal {...restProps} />
