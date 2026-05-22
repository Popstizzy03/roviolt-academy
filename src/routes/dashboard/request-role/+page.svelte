<script lang="ts">
import { Card } from "$lib/components/ui/card/index.js";
import { Button } from "$lib/components/ui/button/index.js";
import { enhance } from "$app/forms";
import type { PageData } from "./$types";

let { data, form }: { data: PageData; form: any } = $props();
</script>

<div class="flex flex-1 flex-col p-6">
	<Card.Root class="mx-auto w-full max-w-md">
		<Card.Header>
			<Card.Title>Request a Role</Card.Title>
			<Card.Description>Apply for instructor, editor, or moderator access. An admin will review your request.</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if form?.message}
				<div
					class="mb-4 rounded-md p-3 text-sm {form.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}"
				>
					{form.message}
				</div>
			{/if}
			<form method="post" action="?/request" use:enhance>
				<div class="mb-4">
					<label for="requestedRole" class="mb-2 block text-sm font-medium">Select Role</label>
					<select
						id="requestedRole"
						name="requestedRole"
						required
						class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					>
						<option value="">Choose a role...</option>
						<option value="instructor">Instructor</option>
						<option value="editor">Editor</option>
						<option value="moderator">Moderator</option>
					</select>
				</div>
				<Button.Root type="submit" class="w-full">Submit Request</Button.Root>
			</form>
		</Card.Content>
	</Card.Root>
</div>
