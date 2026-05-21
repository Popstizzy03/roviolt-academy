<script lang="ts">
import type { Row } from "@tanstack/table-core";
import type { Schema } from "./schemas.js";

let { row }: { row: Row<Schema> } = $props();
</script>

<Badge variant="outline" class="text-muted-foreground px-1.5">
	{#if row.original.status === "Done"}
		<CheckCircleIcon class="fill-green-500 dark:fill-green-400" />
	{:else}
		<SpinnerGapIcon />
	{/if}
	{row.original.status}
</Badge>
