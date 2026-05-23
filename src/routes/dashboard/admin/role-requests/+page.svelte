<script lang="ts">
import { enhance } from "$app/forms";
import { Badge } from "$lib/components/ui/badge/index.js";
import * as Button from "$lib/components/ui/button/index.js";
import * as Card from "$lib/components/ui/card/index.js";
import * as Table from "$lib/components/ui/table/index.js";
import type { PageData } from "./$types";

let { data, form }: { data: PageData; form: import("./$types").ActionData } =
	$props();
let { requests } = $derived(data);
</script>

<div class="flex flex-1 flex-col p-6">
	<Card.Root>
		<Card.Header>
			<Card.Title>Role Requests</Card.Title>
			<Card.Description>Manage student requests for instructor, editor, and moderator roles.</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if form?.message}
				<div class="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
					{form.message}
				</div>
			{/if}
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Email</Table.Head>
						<Table.Head>Requested Role</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Date</Table.Head>
						<Table.Head>Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each requests as req (req.id)}
						<Table.Row>
							<Table.Cell>{req.userName ?? "—"}</Table.Cell>
							<Table.Cell>{req.userEmail}</Table.Cell>
							<Table.Cell class="capitalize">{req.requestedRole}</Table.Cell>
							<Table.Cell>
								<Badge
									variant={req.status === "approved" ? "default" : req.status === "rejected" ? "secondary" : "outline"}
									class="capitalize"
								>
									{req.status}
								</Badge>
							</Table.Cell>
							<Table.Cell>{new Date(req.createdAt).toLocaleDateString()}</Table.Cell>
							<Table.Cell>
								{#if req.status === "pending"}
									<div class="flex gap-2">
										<form method="post" action="?/approve" use:enhance>
											<input type="hidden" name="requestId" value={req.id} />
											<input type="hidden" name="userId" value={req.userId} />
											<input type="hidden" name="requestedRole" value={req.requestedRole} />
											<Button.Root size="sm" variant="default" type="submit">
												Approve
											</Button.Root>
										</form>
										<form method="post" action="?/reject" use:enhance>
											<input type="hidden" name="requestId" value={req.id} />
											<Button.Root size="sm" variant="destructive" type="submit">
												Reject
											</Button.Root>
										</form>
									</div>
								{/if}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
			{#if requests.length === 0}
				<p class="text-muted-foreground py-8 text-center">No role requests yet.</p>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
