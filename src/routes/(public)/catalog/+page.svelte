<script lang="ts">
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-6xl px-4 py-12">
	<h1 class="mb-8 text-3xl font-bold text-zinc-100">Course Catalog</h1>

	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.courses as course (course.id)}
			<a
				href="/catalog/{course.slug}"
				class="group rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-colors hover:border-amber-700/50"
			>
				<div class="mb-3 aspect-video overflow-hidden rounded-lg bg-zinc-900">
					{#if course.thumbnail}
						<img src={course.thumbnail} alt={course.title} class="h-full w-full rounded-lg object-cover" />
					{/if}
				</div>
				<h2 class="text-lg font-semibold text-zinc-200 group-hover:text-amber-400">{course.title}</h2>
				<p class="mt-1 line-clamp-2 text-sm text-zinc-500">{course.description}</p>
				<div class="mt-3 flex items-center justify-between">
					<span class="text-sm font-medium text-zinc-400">
						{course.price === 0 ? "Free" : `$${(course.price / 100).toFixed(2)}`}
					</span>
					{#if course.freemiumLimit}
						<span class="text-xs text-emerald-500">Free preview available</span>
					{/if}
				</div>
			</a>
		{/each}
	</div>
</div>
