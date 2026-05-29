<script lang="ts">
import { enhance } from "$app/forms";
import type { PageData } from "./$types";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "$lib/components/ui/card/index.js";

let { data }: { data: PageData } = $props();

let course = $state({
	title: data.course.title,
	description: data.course.description || "",
	category: data.course.category || "",
	price: String(data.course.price),
	priceZmw: data.course.priceZmw ? String(data.course.priceZmw) : "",
	thumbnail: data.course.thumbnail || "",
	whatYoullLearn:
		(
			data.course.metadata as { whatYoullLearn?: string[] }
		)?.whatYoullLearn?.join("\n") || "",
	prerequisites:
		(data.course.metadata as { prerequisites?: string[] })?.prerequisites?.join(
			"\n",
		) || "",
	isPublished: data.course.isPublished,
});
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-zinc-100">Admin: Edit Course</h1>
		<p class="mt-1 text-zinc-400">Manage all course settings including publication status</p>
	</div>

	<form method="POST" use:enhance class="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle>Publication Status</CardTitle>
				<CardDescription>Toggle visibility of this course for students on the platform</CardDescription>
			</CardHeader>
			<CardContent>
				<label class="flex items-center gap-3">
					<input
						type="checkbox"
						name="isPublished"
						value="true"
						bind:checked={course.isPublished}
						class="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-amber-600"
					/>
					<span class="text-sm text-zinc-300">Published (visible to students)</span>
				</label>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Basic Information</CardTitle>
				<CardDescription>Edit the title, description, and category of the course</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<label for="title" class="mb-1.5 block text-sm font-medium text-zinc-300">Title *</label>
					<Input id="title" name="title" bind:value={course.title} required />
				</div>
				<div>
					<label for="description" class="mb-1.5 block text-sm font-medium text-zinc-300">Description</label>
					<textarea
						id="description"
						name="description"
						bind:value={course.description}
						class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-amber-700"
						rows="3"
					></textarea>
				</div>
				<div>
					<label for="category" class="mb-1.5 block text-sm font-medium text-zinc-300">Category</label>
					<Input id="category" name="category" bind:value={course.category} />
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Pricing</CardTitle>
				<CardDescription>Set price in USD cents and optionally in ZMW for local pricing</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex gap-4">
					<div class="flex-1">
						<label for="price" class="mb-1.5 block text-sm font-medium text-zinc-300">Price (USD cents)</label>
						<Input id="price" name="price" type="number" bind:value={course.price} min="0" />
					</div>
					<div class="flex-1">
						<label for="priceZmw" class="mb-1.5 block text-sm font-medium text-zinc-300">Price (ZMW)</label>
						<Input id="priceZmw" name="priceZmw" type="number" bind:value={course.priceZmw} min="0" />
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Media</CardTitle>
				<CardDescription>Provide a thumbnail image URL for the course card</CardDescription>
			</CardHeader>
			<CardContent>
				<label for="thumbnail" class="mb-1.5 block text-sm font-medium text-zinc-300">Thumbnail URL</label>
				<Input id="thumbnail" name="thumbnail" bind:value={course.thumbnail} />
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Learning Details</CardTitle>
				<CardDescription>List what students will learn and any prerequisites (one per line)</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<label for="whatYoullLearn" class="mb-1.5 block text-sm font-medium text-zinc-300">What You'll Learn</label>
					<textarea
						id="whatYoullLearn"
						name="whatYoullLearn"
						bind:value={course.whatYoullLearn}
						class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-amber-700"
						rows="5"
					></textarea>
				</div>
				<div>
					<label for="prerequisites" class="mb-1.5 block text-sm font-medium text-zinc-300">Prerequisites</label>
					<textarea
						id="prerequisites"
						name="prerequisites"
						bind:value={course.prerequisites}
						class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-amber-700"
						rows="4"
					></textarea>
				</div>
			</CardContent>
		</Card>

		<div class="flex items-center justify-end gap-4">
			<a href="/admin/courses" class="text-sm text-zinc-400 hover:text-zinc-300">Cancel</a>
			<Button type="submit">Save Changes</Button>
		</div>
	</form>
</div>
