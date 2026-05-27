<script lang="ts">
let { config }: { config: { src?: string; provider?: string } } = $props();
</script>

{#if config.provider === "cloudflare"}
	<iframe
		title="Video lesson"
		src={config.src}
		class="aspect-video w-full rounded-lg"
		allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
		allowfullscreen
	></iframe>
{:else if config.src}
	<video controls class="w-full rounded-lg">
		<source src={config.src} type="video/mp4" />
	</video>
{:else}
	<p class="text-zinc-500">No video source configured</p>
{/if}
