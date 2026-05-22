<script lang="ts">
import { Tooltip as TooltipPrimitive } from "bits-ui";

let { ref = $bindable(null), ...restProps }: TooltipPrimitive.TriggerProps =
	$props();
</script>

<TooltipPrimitive.Trigger bind:this={ref} data-slot="tooltip-trigger" {...restProps} />
