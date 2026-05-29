<script lang="ts">
import { Input } from "$lib/components/ui/input/index.js";

let {
	config = $bindable({} as Record<string, unknown>),
}: { config?: Record<string, unknown> } = $props();

let filename = $state((config.filename as string) || "");
let language = $state((config.language as string) || "python");
let starterCode = $state((config.starterCode as string) || "");
let testSpec = $state((config.testSpec as string) || "");

$effect(() => {
	config.filename = filename;
	config.language = language;
	config.starterCode = starterCode;
	config.testSpec = testSpec;
});
</script>

<div class="space-y-3">
	<div>
		<label class="mb-1 block text-xs font-medium text-zinc-400">
			Filename
			<Input bind:value={filename} placeholder="e.g. solution.py" class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-amber-700" />
		</label>
	</div>
	<div>
		<label class="mb-1 block text-xs font-medium text-zinc-400">
			Language
			<select
			bind:value={language}
			class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
		>
			<option value="python">Python</option>
			<option value="javascript">JavaScript</option>
			<option value="typescript">TypeScript</option>
			<option value="html">HTML</option>
			<option value="css">CSS</option>
			<option value="sql">SQL</option>
		</select>
	</label>
	</div>
	<div>
		<label class="mb-1 block text-xs font-medium text-zinc-400">
			Starter Code
			<textarea
			bind:value={starterCode}
			placeholder="Code that appears in the editor when the student opens this block"
			class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-amber-700"
			rows="8"
		></textarea>
	</label>
	</div>
	<div>
		<label class="mb-1 block text-xs font-medium text-zinc-400">
			Test Spec (optional)
			<textarea
			bind:value={testSpec}
			placeholder="Test cases to validate the student's solution"
			class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-mono text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-amber-700"
			rows="4"
		></textarea>
	</label>
	</div>
</div>
