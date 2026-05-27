<script lang="ts">
let {
	config,
	onComplete,
}: {
	config: { code?: string; language?: string; taskPrompt?: string };
	onComplete?: () => void;
} = $props();

let code = $state(config.code || "");
let language = $state(config.language || "python");
let output = $state<Array<{ type: string; text: string }>>([]);
let running = $state(false);
let hinting = $state(false);
let hint: string | null = $state(null);

function stderrText() {
	return output
		.filter((e) => e.type === "stderr")
		.map((e) => e.text)
		.join("\n");
}

async function handleHint() {
	if (hinting) return;
	hinting = true;
	hint = null;
	try {
		const res = await fetch("/api/compute/tutor", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				code,
				errorMessage: stderrText(),
				taskPrompt: config.taskPrompt || "",
			}),
		});
		const data = await res.json();
		hint = data.hint;
	} catch {
		hint = "Failed to get hint. Please try again.";
	}
	hinting = false;
}

function handleRun() {
	if (!code.trim() || running) return;

	running = true;
	output = [];
	hint = null;

	fetch("/api/compute/run", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ code, language }),
	})
		.then(async (response) => {
			if (!response.ok) {
				const text = await response.text();
				output = [
					...output,
					{
						type: "error",
						text: `Request failed (${response.status}): ${text}`,
					},
				];
				running = false;
				return;
			}

			const reader = response.body?.getReader();
			if (!reader) {
				output = [...output, { type: "error", text: "No response body" }];
				running = false;
				return;
			}

			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				let event = "";
				for (const line of lines) {
					if (line.startsWith("event: ")) {
						event = line.slice(7).trim();
					} else if (line.startsWith("data: ")) {
						try {
							const data = JSON.parse(line.slice(6));
							if (event === "stdout" || event === "stderr") {
								output = [...output, { type: event, text: data.output }];
							} else if (event === "error") {
								output = [...output, { type: "error", text: data.message }];
							} else if (event === "status") {
								output = [...output, { type: "status", text: data.message }];
							}
						} catch {
							output = [
								...output,
								{ type: "error", text: `Parse error: ${line.slice(6)}` },
							];
						}
						event = "";
					}
				}

				const lastEntry = output[output.length - 1];
				if (
					lastEntry?.type === "status" &&
					lastEntry.text === "Execution complete."
				) {
					onComplete?.();
				}
			}
			running = false;
		})
		.catch((err: Error) => {
			output = [...output, { type: "error", text: err.message }];
			running = false;
		});
}
</script>

<div class="space-y-4">
	<div class="flex items-center gap-3">
		<select
			bind:value={language}
			class="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300"
		>
			<option value="python">Python</option>
			<option value="javascript">JavaScript</option>
		</select>

		<button
			onclick={handleRun}
			disabled={running}
			class="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{running ? "Running..." : "Run"}
		</button>

		{#if stderrText()}
			<button
				onclick={handleHint}
				disabled={hinting}
				class="rounded-lg bg-indigo-700 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{hinting ? "Thinking..." : "Get AI Hint"}
			</button>
		{/if}
	</div>

	<textarea
		bind:value={code}
		rows="8"
		class="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 font-mono text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-700 focus:outline-none"
		placeholder="Write your code here..."
	></textarea>

	{#if output.length > 0}
		<div class="max-h-64 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-sm">
			{#each output as entry, i}
				<div class="py-0.5">
					{#if entry.type === "stdout"}
						<span class="text-zinc-300">{entry.text}</span>
					{:else if entry.type === "stderr"}
						<span class="text-red-400">{entry.text}</span>
					{:else if entry.type === "status"}
						<span class="text-zinc-500 italic">{entry.text}</span>
					{:else if entry.type === "error"}
						<span class="text-red-500 font-medium">{entry.text}</span>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	{#if hint}
		<div class="rounded-lg border border-indigo-800/40 bg-indigo-950/20 p-4">
			<p class="mb-2 text-sm font-semibold text-indigo-300">AI Hint</p>
			<p class="text-sm text-zinc-300">{hint}</p>
		</div>
	{/if}
</div>
