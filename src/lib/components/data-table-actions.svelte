<script lang="ts">
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger class="data-[state=open]:bg-muted text-muted-foreground flex size-8">
		{#snippet child({ props })}
			<Button variant="ghost" size="icon" {...props}>
				<DotsThreeVerticalIcon />
				<span class="sr-only">Open menu</span>
			</Button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end" class="w-32">
		<DropdownMenu.Item>Edit</DropdownMenu.Item>
		<DropdownMenu.Item>Make a copy</DropdownMenu.Item>
		<DropdownMenu.Item>Favorite</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item variant="destructive">Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
