<script lang="ts">
import VideoBlockEditor from "./VideoBlockEditor.svelte";
import ReadingBlockEditor from "./ReadingBlockEditor.svelte";
import CodeBlockEditor from "./CodeBlockEditor.svelte";

let {
	type,
	config = $bindable({} as Record<string, unknown>),
}: {
	type: string;
	config?: Record<string, unknown>;
} = $props();
</script>

{#if type === "video"}
	<VideoBlockEditor bind:config />
{:else if type === "reading"}
	<ReadingBlockEditor bind:config />
{:else if type === "code"}
	<CodeBlockEditor bind:config />
{:else if type === "quiz"}
	<p class="text-sm text-zinc-500">Quiz editor coming soon</p>
{:else if type === "dragdrop"}
	<p class="text-sm text-zinc-500">Drag & Drop editor coming soon</p>
{:else}
	<p class="text-sm text-zinc-500">Unknown block type: {type}</p>
{/if}
