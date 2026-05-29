<script lang="ts">
import type { PageData } from "./$types";
import { Button } from "$lib/components/ui/button/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";

let { data }: { data: PageData } = $props();

function priceDisplay(cents: number) {
	return cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}`;
}
</script>

<div class="mx-auto max-w-6xl px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-zinc-100">My Courses</h1>
			<p class="mt-1 text-zinc-400">Manage your course content and curriculum</p>
		</div>
		<a href="/instructor/courses/new">
			<Button>Create Course</Button>
		</a>
	</div>

	{#if data.courses.length === 0}
		<div class="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 py-20">
			<p class="mb-2 text-lg text-zinc-400">No courses yet</p>
			<p class="mb-6 text-sm text-zinc-500">Create your first course to get started</p>
			<a href="/instructor/courses/new">
				<Button>Create Your First Course</Button>
			</a>
		</div>
	{:else}
		<div class="space-y-4">
			{#each data.courses as course (course.id)}
				<a
					href="/instructor/courses/{course.id}/builder"
					class="flex items-center gap-6 rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 transition-colors hover:border-zinc-700"
				>
					<div class="h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900">
						{#if course.thumbnail}
							<img src={course.thumbnail} alt={course.title} class="h-full w-full object-cover" />
						{/if}
					</div>
					<div class="min-w-0 flex-1">
						<h2 class="text-lg font-semibold text-zinc-200">{course.title}</h2>
						<p class="mt-1 line-clamp-1 text-sm text-zinc-500">{course.description || "No description"}</p>
						<div class="mt-2 flex items-center gap-3">
							{#if course.isPublished}
								<Badge variant="default" class="bg-emerald-700 text-emerald-200">Published</Badge>
							{:else}
								<Badge variant="secondary">Draft</Badge>
							{/if}
							<span class="text-sm text-zinc-500">{priceDisplay(course.price)}</span>
							{#if course.category}
								<span class="text-sm text-zinc-500">{course.category}</span>
							{/if}
						</div>
					</div>
					<div class="text-sm text-zinc-500">
						Edit &rarr;
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
