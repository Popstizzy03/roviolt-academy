<script lang="ts">
import CreditCardIcon from "phosphor-svelte/lib/CreditCard";
import DotsThreeVerticalIcon from "phosphor-svelte/lib/DotsThreeVertical";
import SignOutIcon from "phosphor-svelte/lib/SignOut";
import BellIcon from "phosphor-svelte/lib/Bell";
import UserCircleIcon from "phosphor-svelte/lib/UserCircle";
import * as Avatar from "$lib/components/ui/avatar/index.js";
import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import { useUser } from "$lib/client/state/user.svelte";
import { goto } from "$app/navigation";
import { resolve } from "$app/paths";

const sidebar = Sidebar.useSidebar();
const session = useUser();

async function handleSignOut() {
	await fetch("/dashboard?/signOut", {
		method: "POST",
		redirect: "manual",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams(),
	});
	await goto(resolve("/signin"));
}

let displayUser = $derived({
	name: session.displayName,
	email: session.current?.email ?? "",
	avatar: session.current?.image ?? "",
});
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						<Avatar.Root class="size-8 rounded-lg grayscale">
							<Avatar.Image src={displayUser.avatar} alt={displayUser.name} />
							<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">{displayUser.name}</span>
							<span class="text-muted-foreground truncate text-xs">
								{displayUser.email}
							</span>
						</div>
						<DotsThreeVerticalIcon class="ms-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				side={sidebar.isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Label class="p-0 font-normal">
					<div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
						<Avatar.Root class="size-8 rounded-lg">
							<Avatar.Image src={displayUser.avatar} alt={displayUser.name} />
							<Avatar.Fallback class="rounded-lg">CN</Avatar.Fallback>
						</Avatar.Root>
						<div class="grid flex-1 text-start text-sm leading-tight">
							<span class="truncate font-medium">{displayUser.name}</span>
							<span class="text-muted-foreground truncate text-xs">
								{displayUser.email}
							</span>
						</div>
					</div>
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Group>
					<DropdownMenu.Item>
						<UserCircleIcon />
						Account
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<CreditCardIcon />
						Billing
					</DropdownMenu.Item>
					<DropdownMenu.Item>
						<BellIcon />
						Notifications
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={handleSignOut}>
					<SignOutIcon />
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
