<script lang="ts">
import { Badge } from "$lib/components/ui/badge/index.js";
import CheckCircleIcon from "phosphor-svelte/lib/CheckCircle";
import SpinnerIcon from "phosphor-svelte/lib/Spinner";
import type { Row } from "@tanstack/table-core";
import type { Schema } from "./schemas.js";

let { row }: { row: Row<Schema> } = $props();
</script>

<Badge variant="outline" class="text-muted-foreground px-1.5">
	{#if row.original.status === "Done"}
		<CheckCircleIcon class="text-green-500 dark:text-green-400" />
	{:else}
		<SpinnerIcon class="animate-spin" />
	{/if}
	{row.original.status}
</Badge>
