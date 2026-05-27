<script lang="ts">
let { config }: { config: { content?: string } } = $props();
</script>

{#if config.content}
	<div class="prose prose-invert max-w-none">{@html config.content}</div>
{:else}
	<p class="text-zinc-500">No content</p>
{/if}
