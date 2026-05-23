<script lang="ts">
import { enhance } from "$app/forms";
import * as Button from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";

let {
	data,
	form,
}: { data: import("./$types").PageData; form: import("./$types").ActionData } =
	$props();
</script>

<div class="flex flex-1 flex-col p-6">
	<Card.Root class="mx-auto w-full max-w-md">
		<Card.Header>
			<Card.Title>Request a Role</Card.Title>
			<Card.Description>
				{#if data.availableRoles.length === 0}
					You already hold the highest role available.
				{:else}
					Select a role to request. An admin will review your submission.
				{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if form?.message}
				<div
					class="mb-4 rounded-md p-3 text-sm {form.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}"
				>
					{form.message}
				</div>
			{/if}
			{#if data.availableRoles.length > 0}
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
							{#each data.availableRoles as role (role)}
								<option value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
							{/each}
						</select>
					</div>
					<Button.Root type="submit" class="w-full">Submit Request</Button.Root>
				</form>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
