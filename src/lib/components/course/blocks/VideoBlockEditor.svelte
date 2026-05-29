<script lang="ts">
import { Input } from "$lib/components/ui/input/index.js";

let {
	config = $bindable({} as Record<string, unknown>),
}: { config?: Record<string, unknown> } = $props();

let src = $state((config.src as string) || "");
let caption = $state((config.caption as string) || "");
let provider = $state((config.provider as string) || "native");

$effect(() => {
	config.src = src;
	config.caption = caption;
	config.provider = provider;
});
</script>

<div class="space-y-3">
	<div>
		<label class="mb-1 block text-xs font-medium text-zinc-400">
			Video URL
			<Input bind:value={src} placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL" />
		</label>
	</div>
	<div>
		<label class="mb-1 block text-xs font-medium text-zinc-400">
			Caption
			<Input bind:value={caption} placeholder="Optional caption text" />
		</label>
	</div>
	<div>
		<label class="mb-1 block text-xs font-medium text-zinc-400">
			Provider
			<select
				bind:value={provider}
				class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
			>
				<option value="native">Native HTML5 Video</option>
				<option value="youtube">YouTube</option>
				<option value="vimeo">Vimeo</option>
				<option value="cloudflare-stream">Cloudflare Stream</option>
			</select>
		</label>
	</div>
</div>
