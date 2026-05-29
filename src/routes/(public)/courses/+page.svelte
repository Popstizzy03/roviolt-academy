<script lang="ts">
import type { PageData } from "./$types";
import CourseCard from "$lib/components/course/CourseCard.svelte";

let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-6xl px-4 py-12">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-zinc-100">Course Catalog</h1>
		<p class="mt-1 text-zinc-400">Explore our courses and start learning</p>
	</div>

	{#if data.courses.length === 0}
		<div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-20">
			<p class="text-lg text-zinc-400">No courses available yet</p>
			<p class="mt-1 text-sm text-zinc-500">Check back soon for new content</p>
		</div>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.courses as course (course.id)}
				<CourseCard {course} />
			{/each}
		</div>
	{/if}
</div>
