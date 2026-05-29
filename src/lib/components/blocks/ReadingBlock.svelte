<script lang="ts">
import Markdown from "svelte-markdown";

let {
	config,
	onComplete,
}: { config: { content?: string }; onComplete?: () => void } = $props();

let container: HTMLDivElement | undefined = $state();
let observed = $state(false);

$effect(() => {
	if (container && onComplete && !observed) {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting) {
					observed = true;
					onComplete();
					observer.disconnect();
				}
			},
			{ threshold: 0.5 },
		);
		observer.observe(container);
		return () => observer.disconnect();
	}
});
</script>

{#if config.content}
	<div bind:this={container} class="prose prose-invert max-w-none">
		<Markdown source={config.content} />
	</div>
{:else}
	<p class="text-zinc-500">No content</p>
{/if}
