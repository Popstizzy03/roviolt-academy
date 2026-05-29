<script lang="ts">
import { enhance } from "$app/forms";
import { Button } from "$lib/components/ui/button/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "$lib/components/ui/card/index.js";

let course = $state({
	title: "",
	description: "",
	category: "",
	price: "",
	priceZmw: "",
	thumbnail: "",
	whatYoullLearn: "",
	prerequisites: "",
});
</script>

<div class="mx-auto max-w-3xl px-4 py-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-zinc-100">Create Course</h1>
		<p class="mt-1 text-zinc-400">Set up your course details and structure</p>
	</div>

	<form method="POST" use:enhance class="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle>Basic Information</CardTitle>
				<CardDescription>Title, description, and categorization</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<label for="title" class="mb-1.5 block text-sm font-medium text-zinc-300">Title *</label>
					<Input id="title" name="title" bind:value={course.title} placeholder="e.g. Complete Web Development Bootcamp" required />
				</div>

				<div>
					<label for="description" class="mb-1.5 block text-sm font-medium text-zinc-300">Description</label>
					<textarea
						id="description"
						name="description"
						bind:value={course.description}
						placeholder="Brief overview of what the course covers"
						class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-amber-700"
						rows="3"
					></textarea>
				</div>

				<div>
					<label for="category" class="mb-1.5 block text-sm font-medium text-zinc-300">Category</label>
					<Input id="category" name="category" bind:value={course.category} placeholder="e.g. Web Development, Design, Data Science" />
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Pricing</CardTitle>
				<CardDescription>Set prices in USD and ZMW (Zambian Kwacha)</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex gap-4">
					<div class="flex-1">
						<label for="price" class="mb-1.5 block text-sm font-medium text-zinc-300">Price (USD cents) *</label>
						<Input id="price" name="price" type="number" bind:value={course.price} placeholder="e.g. 2999 = $29.99" min="0" required />
						<p class="mt-1 text-xs text-zinc-500">Price in USD cents (e.g. 2999 = $29.99)</p>
					</div>
					<div class="flex-1">
						<label for="priceZmw" class="mb-1.5 block text-sm font-medium text-zinc-300">Price (ZMW)</label>
						<Input id="priceZmw" name="priceZmw" type="number" bind:value={course.priceZmw} placeholder="e.g. 500" min="0" />
						<p class="mt-1 text-xs text-zinc-500">Zambian Kwacha (for Lenco payments)</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Media</CardTitle>
				<CardDescription>Course thumbnail image</CardDescription>
			</CardHeader>
			<CardContent>
				<label for="thumbnail" class="mb-1.5 block text-sm font-medium text-zinc-300">Thumbnail URL</label>
				<Input id="thumbnail" name="thumbnail" bind:value={course.thumbnail} placeholder="https://example.com/thumbnail.jpg" />
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Learning Details</CardTitle>
				<CardDescription>What students will learn and prerequisites</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div>
					<label for="whatYoullLearn" class="mb-1.5 block text-sm font-medium text-zinc-300">What You'll Learn</label>
					<textarea
						id="whatYoullLearn"
						name="whatYoullLearn"
						bind:value={course.whatYoullLearn}
						placeholder="One item per line&#10;e.g.&#10;Build full-stack web applications&#10;Deploy apps to production&#10;Use modern frameworks"
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
						placeholder="One item per line&#10;e.g.&#10;Basic HTML knowledge&#10;Familiarity with JavaScript"
						class="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none transition-colors focus:border-amber-700"
						rows="4"
					></textarea>
				</div>
			</CardContent>
		</Card>

		<div class="flex items-center justify-end gap-4">
			<a href="/instructor" class="text-sm text-zinc-400 hover:text-zinc-300">Cancel</a>
			<Button type="submit">Create Course</Button>
		</div>
	</form>
</div>
