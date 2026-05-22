<script lang="ts">
import { Dialog as SheetPrimitive } from "bits-ui";

let { ref = $bindable(null), ...restProps }: SheetPrimitive.CloseProps =
	$props();
</script>

<SheetPrimitive.Close bind:this={ref} data-slot="sheet-close" {...restProps} />
