<script lang="ts">
import VideoBlock from "./VideoBlock.svelte";
import ReadingBlock from "./ReadingBlock.svelte";
import CodeBlock from "./CodeBlock.svelte";

let {
	blocks,
	onComplete,
}: {
	blocks: Array<{ id: string; type: string; config: unknown; points: number }>;
	onComplete?: (blockId: string, points: number) => void;
} = $props();
</script>

{#each blocks as block (block.id)}
	<div class="mb-6 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 backdrop-blur-md">
		{#if block.type === "video"}
			<VideoBlock
				config={block.config as Record<string, unknown>}
				onComplete={() => onComplete?.(block.id, block.points)}
			/>
		{:else if block.type === "reading"}
			<ReadingBlock
				config={block.config as Record<string, unknown>}
				onComplete={() => onComplete?.(block.id, block.points)}
			/>
		{:else if block.type === "code"}
			<CodeBlock
				config={block.config as Record<string, unknown>}
				onComplete={() => onComplete?.(block.id, block.points)}
			/>
		{:else}
			<p class="text-zinc-500">Unknown block type: {String(block.type)}</p>
		{/if}
	</div>
{/each}
