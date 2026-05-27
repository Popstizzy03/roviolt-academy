<script lang="ts">
import type { PageData } from "./$types";
import BlockDispatcher from "$lib/components/blocks/BlockDispatcher.svelte";

let { data }: { data: PageData } = $props();

let feedback = $state<string | null>(null);

async function handleBlockComplete(blockId: string, points: number) {
	try {
		const res = await fetch("/api/progress/complete", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ blockId, lessonId: data.lesson.id }),
		});
		const result = await res.json();
		if (result.leveledUp) {
			feedback = `Level up! You're now level ${result.level}. +${result.xpEarned} XP`;
		} else if (!result.alreadyCompleted) {
			feedback = `+${result.xpEarned} XP (Level ${result.level})`;
		}
		setTimeout(() => (feedback = null), 3000);
	} catch {
		feedback = "Failed to save progress";
		setTimeout(() => (feedback = null), 3000);
	}
}
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
	<div class="mb-4 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-zinc-100">{data.lesson.title}</h1>
			{#if data.lesson.description}
				<p class="mt-1 text-zinc-400">{data.lesson.description}</p>
			{/if}
		</div>
		{#if feedback}
			<div class="rounded-lg bg-emerald-900/60 px-4 py-2 text-sm font-medium text-emerald-300">
				{feedback}
			</div>
		{/if}
	</div>
	<BlockDispatcher blocks={data.blocks} onComplete={handleBlockComplete} />
</div>
