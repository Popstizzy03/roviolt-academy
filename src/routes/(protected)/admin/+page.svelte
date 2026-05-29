<script lang="ts">
import { useUser } from "$lib/client/state/user.svelte.js";
import { Button } from "$lib/components/ui/button/index.js";

const user = useUser();
</script>

<div class="mx-auto max-w-4xl px-4 py-8">
	<h1 class="mb-2 text-3xl font-bold text-zinc-100">Admin Dashboard</h1>
	<p class="mb-8 text-zinc-400">Welcome, {user.displayName}</p>

	<div class="grid gap-6 sm:grid-cols-2">
		<Button
			href="/admin/courses"
			variant="outline"
			class="h-auto items-start justify-start rounded-xl border-zinc-800 bg-zinc-950/60 p-6 hover:border-zinc-700"
		>
			<div class="text-left">
				<h2 class="text-lg font-semibold text-zinc-200">Manage Courses</h2>
				<p class="mt-1 text-sm text-zinc-500">View, edit, publish, or unpublish all courses</p>
			</div>
		</Button>
		<Button
			href="/dashboard/admin/role-requests"
			variant="outline"
			class="h-auto items-start justify-start rounded-xl border-zinc-800 bg-zinc-950/60 p-6 hover:border-zinc-700"
		>
			<div class="text-left">
				<h2 class="text-lg font-semibold text-zinc-200">Role Requests</h2>
				<p class="mt-1 text-sm text-zinc-500">Approve or reject instructor/editor role requests</p>
			</div>
		</Button>
		<Button
			href="/admin/payments"
			variant="outline"
			class="h-auto items-start justify-start rounded-xl border-zinc-800 bg-zinc-950/60 p-6 hover:border-zinc-700"
		>
			<div class="text-left">
				<h2 class="text-lg font-semibold text-zinc-200">Manage Payments</h2>
				<p class="mt-1 text-sm text-zinc-500">View and approve pending payments</p>
			</div>
		</Button>
	</div>
</div>
