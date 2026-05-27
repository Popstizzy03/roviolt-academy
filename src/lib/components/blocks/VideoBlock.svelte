<script lang="ts">
let {
	config,
	onComplete,
}: { config: { src?: string; provider?: string }; onComplete?: () => void } =
	$props();
</script>

{#if config.provider === "cloudflare"}
	<iframe
		title="Video lesson"
		src={config.src}
		class="aspect-video w-full rounded-lg"
		allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
		allowfullscreen
		onload={() => onComplete?.()}
	></iframe>
{:else if config.src}
	<video controls class="w-full rounded-lg" onplay={() => onComplete?.()}>
		<source src={config.src} type="video/mp4" />
	</video>
{:else}
	<p class="text-zinc-500">No video source configured</p>
{/if}
