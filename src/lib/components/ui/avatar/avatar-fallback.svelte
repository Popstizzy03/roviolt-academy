<script lang="ts">
import type { Avatar as AvatarPrimitive } from "bits-ui";

let {
	ref = $bindable(null),
	class: className,
	...restProps
}: AvatarPrimitive.FallbackProps = $props();
</script>

<AvatarPrimitive.Fallback
	bind:ref
	data-slot="avatar-fallback"
	class={cn(
		"bg-muted text-muted-foreground rounded-full flex size-full items-center justify-center text-sm group-data-[size=sm]/avatar:text-xs",
		className
	)}
	{...restProps}
/>
