<script lang="ts">
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();
</script>

<div class="mx-auto max-w-2xl px-4 py-12">
	<h1 class="text-2xl font-bold text-zinc-100">{data.course?.title || "Course"}</h1>
	<p class="mt-4 text-zinc-400">This course has no lessons yet. Check back later.</p>
	<a href="/courses" class="mt-6 inline-block text-sm text-amber-500 hover:text-amber-400">
		&larr; Browse courses
	</a>
</div>
