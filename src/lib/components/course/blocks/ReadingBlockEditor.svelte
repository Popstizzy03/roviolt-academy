<script lang="ts">
let {
	config = $bindable({} as Record<string, unknown>),
}: { config?: Record<string, unknown> } = $props();

let content = $state((config.content as string) || "");

$effect(() => {
	config.content = content;
});
</script>

<div>
	<label class="mb-1 block text-xs font-medium text-zinc-400">
		Reading Content (Markdown supported)
		<textarea
		bind:value={content}
		placeholder="Write your lesson content here... Supports **markdown** formatting."
		class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-amber-700"
		rows="12"
	></textarea>
	</label>
</div>
