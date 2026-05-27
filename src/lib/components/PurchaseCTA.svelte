<script lang="ts">
let {
	freemiumLimit = 0,
	freemiumLessonsViewed = 0,
}: { freemiumLimit?: number; freemiumLessonsViewed?: number } = $props();
</script>

<div class="flex flex-col items-center gap-4 rounded-xl border border-amber-800/40 bg-amber-950/20 p-8 text-center backdrop-blur-md">
	<div class="text-4xl">🔒</div>
	<h2 class="text-xl font-semibold text-amber-200">Free Preview Limit Reached</h2>
	<p class="max-w-md text-zinc-400">
		You've viewed {freemiumLessonsViewed} of {freemiumLimit} free lessons.
		Purchase this course to unlock the full content, including all modules,
		exercises, and certification.
	</p>
	<button
		type="button"
		class="mt-2 rounded-lg bg-amber-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-amber-500"
	>
		Purchase Course
	</button>
</div>
