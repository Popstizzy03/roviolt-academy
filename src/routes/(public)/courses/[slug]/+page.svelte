<script lang="ts">
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();

let expandedModule = $state<string | null>(null);

function toggleModule(id: string) {
	expandedModule = expandedModule === id ? null : id;
}

function groupedLessons(moduleId: string) {
	return data.lessons.filter((l) => l.moduleId === moduleId);
}

function priceDisplay(cents: number) {
	return cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}`;
}

const metadata = data.course.metadata as {
	whatYoullLearn?: string[];
	prerequisites?: string[];
};
</script>

<div class="mx-auto max-w-4xl px-4 py-12">
	<div class="mb-8">
		{#if data.course.thumbnail}
			<img
				src={data.course.thumbnail}
				alt={data.course.title}
				class="mb-6 aspect-video w-full rounded-xl object-cover"
			/>
		{/if}

		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="text-3xl font-bold text-zinc-100">{data.course.title}</h1>
				{#if data.course.instructorName}
					<p class="mt-1 text-sm text-zinc-500">Created by {data.course.instructorName}</p>
				{/if}
				{#if data.course.category}
					<span class="mt-2 inline-block rounded-full bg-zinc-800 px-3 py-0.5 text-xs text-zinc-400">
						{data.course.category}
					</span>
				{/if}
			</div>
		</div>

		<p class="mt-4 text-zinc-400">{data.course.description}</p>

		<div class="mt-6 flex items-center gap-4">
			<span class="text-lg font-semibold text-zinc-200">{priceDisplay(data.course.price)}</span>

			{#if data.enrollment}
				<a
					href="/learn/{data.course.id}"
					class="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500"
				>
					Continue Learning
				</a>
			{:else if data.course.price === 0}
				<form method="POST" action="?/enroll">
					<button
						type="submit"
						class="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500"
					>
						Enroll Free
					</button>
				</form>
			{:else}
				<a
					href="/courses/{data.course.slug}/checkout"
					class="rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-500"
				>
					Purchase &mdash; {priceDisplay(data.course.price)}
				</a>
			{/if}
		</div>
	</div>

	{#if metadata?.whatYoullLearn?.length}
		<div class="mb-8 rounded-xl border border-zinc-800 bg-zinc-950/40 p-6">
			<h2 class="mb-3 text-lg font-semibold text-zinc-200">What You'll Learn</h2>
			<ul class="grid gap-2 sm:grid-cols-2">
				{#each metadata.whatYoullLearn as item (item)}
					<li class="flex items-start gap-2 text-sm text-zinc-400">
						<span class="mt-0.5 text-amber-500">✓</span>
						{item}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	{#if metadata?.prerequisites?.length}
		<div class="mb-8 rounded-xl border border-zinc-800 bg-zinc-950/40 p-6">
			<h2 class="mb-3 text-lg font-semibold text-zinc-200">Prerequisites</h2>
			<ul class="space-y-1">
				{#each metadata.prerequisites as item (item)}
					<li class="flex items-start gap-2 text-sm text-zinc-400">
						<span class="mt-0.5 text-zinc-600">▸</span>
						{item}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<h2 class="mb-4 text-xl font-semibold text-zinc-200">Curriculum</h2>

	<div class="space-y-2">
		{#each data.modules as mod (mod.id)}
			<div class="rounded-lg border border-zinc-800 bg-zinc-950/40">
				<button
					onclick={() => toggleModule(mod.id)}
					class="flex w-full items-center justify-between px-4 py-3 text-left"
				>
					<span class="font-medium text-zinc-200">Module {mod.order}: {mod.title}</span>
					<span class="text-zinc-500">{expandedModule === mod.id ? "▲" : "▼"}</span>
				</button>
				{#if expandedModule === mod.id}
					<div class="border-t border-zinc-800 px-4 py-2">
						{#each groupedLessons(mod.id) as lesson (lesson.id)}
							<a
								href="/learn/{data.course.id}/{lesson.id}"
								class="flex items-center gap-2 py-1.5 text-sm text-zinc-400 transition-colors hover:text-zinc-200"
							>
								<span class="h-1.5 w-1.5 rounded-full bg-zinc-600"></span>
								{lesson.title}
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>
