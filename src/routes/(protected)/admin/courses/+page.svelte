<script lang="ts">
import type { PageData } from "./$types";
import { Button } from "$lib/components/ui/button/index.js";
import { Badge } from "$lib/components/ui/badge/index.js";

let { data }: { data: PageData } = $props();

function priceDisplay(cents: number) {
	return cents === 0 ? "Free" : `$${(cents / 100).toFixed(2)}`;
}

function formatDate(date: Date | string | null) {
	if (!date) return "-";
	return new Date(date).toLocaleDateString();
}
</script>

<div class="mx-auto max-w-6xl px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-zinc-100">All Courses</h1>
			<p class="mt-1 text-zinc-400">Administer all courses on the platform</p>
		</div>
		<a href="/instructor/courses/new">
			<Button>Create Course</Button>
		</a>
	</div>

	<div class="overflow-hidden rounded-xl border border-zinc-800">
		<table class="w-full text-left text-sm">
			<thead class="border-b border-zinc-800 bg-zinc-950/80">
				<tr>
					<th class="px-4 py-3 font-medium text-zinc-400">Title</th>
					<th class="px-4 py-3 font-medium text-zinc-400">Creator</th>
					<th class="px-4 py-3 font-medium text-zinc-400">Category</th>
					<th class="px-4 py-3 font-medium text-zinc-400">Price</th>
					<th class="px-4 py-3 font-medium text-zinc-400">Status</th>
					<th class="px-4 py-3 font-medium text-zinc-400">Created</th>
					<th class="px-4 py-3 font-medium text-zinc-400"></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-zinc-800">
				{#each data.courses as course (course.id)}
					<tr class="transition-colors hover:bg-zinc-950/40">
						<td class="px-4 py-3">
							<div class="flex items-center gap-3">
								<div class="h-10 w-16 flex-shrink-0 overflow-hidden rounded bg-zinc-900">
									{#if course.thumbnail}
										<img src={course.thumbnail} alt="" class="h-full w-full object-cover" />
									{/if}
								</div>
								<div>
									<p class="font-medium text-zinc-200">{course.title}</p>
									<p class="line-clamp-1 text-zinc-500">{course.description || "-"}</p>
								</div>
							</div>
						</td>
						<td class="px-4 py-3 text-zinc-400">{course.creatorName || course.creatorEmail || "-"}</td>
						<td class="px-4 py-3 text-zinc-400">{course.category || "-"}</td>
						<td class="px-4 py-3 text-zinc-400">{priceDisplay(course.price)}</td>
						<td class="px-4 py-3">
							{#if course.isPublished}
								<Badge variant="default" class="bg-emerald-700 text-emerald-200">Published</Badge>
							{:else}
								<Badge variant="secondary">Draft</Badge>
							{/if}
						</td>
						<td class="px-4 py-3 text-zinc-500">{formatDate(course.createdAt)}</td>
						<td class="px-4 py-3">
							<a href="/admin/courses/{course.id}/edit" class="text-sm text-amber-500 hover:text-amber-400">
								Edit
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
