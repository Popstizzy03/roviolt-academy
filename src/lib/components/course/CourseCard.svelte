<script lang="ts">
import { Badge } from "$lib/components/ui/badge/index.js";

interface Course {
	id: string;
	title: string;
	description: string | null;
	slug: string;
	thumbnail: string | null;
	category: string | null;
	instructorName: string | null;
	isPublished: boolean;
	price: number;
	priceZmw: number | null;
	metadata: Record<string, unknown>;
}

let {
	course,
	currency = "USD",
}: {
	course: Course;
	currency?: "USD" | "ZMW";
} = $props();

const courseMetadata = $derived(
	course.metadata as {
		whatYoullLearn?: string[];
		prerequisites?: string[];
	},
);

const previewItem = $derived(courseMetadata.whatYoullLearn?.[0] ?? null);

const hasDiscount = $derived(course.price > 0);

function priceDisplay() {
	if (currency === "ZMW" && course.priceZmw) {
		return `K${course.priceZmw.toLocaleString()}`;
	}
	if (course.price === 0) return "Free";
	return `$${(course.price / 100).toFixed(2)}`;
}

function originalPriceDisplay() {
	if (currency === "ZMW" && course.priceZmw) {
		const original = Math.round(course.priceZmw * 1.3);
		return `K${original.toLocaleString()}`;
	}
	const original = Math.round(course.price * 1.3);
	return `$${(original / 100).toFixed(2)}`;
}
</script>

<a
	data-course-id={course.id}
	href="/courses/{course.slug}"
	class="group flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60 transition-colors hover:border-amber-700/50"
>
	<div class="aspect-video overflow-hidden bg-zinc-900">
		{#if course.thumbnail}
			<img
				src={course.thumbnail}
				alt={course.title}
				class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
			/>
		{:else}
			<div class="flex h-full items-center justify-center">
				<span class="text-4xl text-zinc-700">📚</span>
			</div>
		{/if}
	</div>

	<div class="flex flex-1 flex-col gap-2 p-4">
		<div class="flex items-start justify-between gap-2">
			<h3 class="line-clamp-2 text-base font-semibold leading-tight text-zinc-200 group-hover:text-amber-400">
				{course.title}
			</h3>
		</div>

		{#if course.instructorName}
			<p class="text-xs text-zinc-500">by {course.instructorName}</p>
		{/if}

		<p class="line-clamp-2 text-sm text-zinc-500">
			{course.description || "No description"}
		</p>

		{#if previewItem}
			<p class="line-clamp-1 text-xs text-zinc-500">{previewItem}</p>
		{/if}

		<div class="mt-auto flex items-center gap-2 pt-2">
			{#if !course.isPublished}
				<Badge variant="outline" class="border-amber-700 text-amber-400 text-xs">Draft</Badge>
			{/if}
			{#if course.category}
				<Badge variant="secondary" class="text-xs">{course.category}</Badge>
			{/if}
			{#if currency === "ZMW"}
				<Badge variant="outline" class="border-emerald-700 text-emerald-400 text-xs">Local Price</Badge>
			{/if}
		</div>

		<div class="flex items-center justify-between pt-1">
			<div class="flex items-baseline gap-2">
				<span class="text-lg font-bold text-zinc-100">{priceDisplay()}</span>
				{#if hasDiscount}
					<span class="text-xs text-zinc-600 line-through">{originalPriceDisplay()}</span>
				{/if}
			</div>
			<span class="text-sm font-medium text-amber-500 transition-colors group-hover:text-amber-400">
				View &rarr;
			</span>
		</div>
	</div>
</a>
