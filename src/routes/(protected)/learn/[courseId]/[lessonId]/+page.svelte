<script lang="ts">
import type { PageData } from "./$types";
import BlockDispatcher from "$lib/components/blocks/BlockDispatcher.svelte";

let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
	<h1 class="mb-2 text-2xl font-bold text-zinc-100">{data.lesson.title}</h1>
	{#if data.lesson.description}
		<p class="mb-8 text-zinc-400">{data.lesson.description}</p>
	{/if}
	<BlockDispatcher blocks={data.blocks} />
</div>
