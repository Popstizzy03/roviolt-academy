<script lang="ts">
import CameraIcon from "phosphor-svelte/lib/Camera";
import ChartBarIcon from "phosphor-svelte/lib/ChartBar";
import DatabaseIcon from "phosphor-svelte/lib/Database";
import FileIcon from "phosphor-svelte/lib/File";
import FileDocIcon from "phosphor-svelte/lib/FileDoc";
import FileTextIcon from "phosphor-svelte/lib/FileText";
import FolderIcon from "phosphor-svelte/lib/Folder";
import GearIcon from "phosphor-svelte/lib/Gear";
import LayoutIcon from "phosphor-svelte/lib/Layout";
import ListDashesIcon from "phosphor-svelte/lib/ListDashes";
import MagnifyingGlassIcon from "phosphor-svelte/lib/MagnifyingGlass";
import QuestionIcon from "phosphor-svelte/lib/Question";
import UsersIcon from "phosphor-svelte/lib/Users";
import type { ComponentProps } from "svelte";
import type * as Sidebar from "$lib/components/ui/sidebar/index.js";

const _data = {
	user: {
		name: "shadcn",
		email: "m@example.com",
		avatar: "/avatars/shadcn.jpg",
	},
	navMain: [
		{
			title: "Dashboard",
			url: "#",
			icon: LayoutIcon,
		},
		{
			title: "Lifecycle",
			url: "#",
			icon: ListDashesIcon,
		},
		{
			title: "Analytics",
			url: "#",
			icon: ChartBarIcon,
		},
		{
			title: "Projects",
			url: "#",
			icon: FolderIcon,
		},
		{
			title: "Team",
			url: "#",
			icon: UsersIcon,
		},
	],
	navClouds: [
		{
			title: "Capture",
			icon: CameraIcon,
			isActive: true,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Proposal",
			icon: FileTextIcon,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
		{
			title: "Prompts",
			icon: FileIcon,
			url: "#",
			items: [
				{
					title: "Active Proposals",
					url: "#",
				},
				{
					title: "Archived",
					url: "#",
				},
			],
		},
	],
	navSecondary: [
		{
			title: "Settings",
			url: "/dashboard/settings",
			icon: GearIcon,
		},
		{
			title: "Get Help",
			url: "#",
			icon: QuestionIcon,
		},
		{
			title: "Search",
			url: "#",
			icon: MagnifyingGlassIcon,
		},
	],
	documents: [
		{
			name: "Data Library",
			url: "#",
			icon: DatabaseIcon,
		},
		{
			name: "Reports",
			url: "#",
			icon: FileTextIcon,
		},
		{
			name: "Word Assistant",
			url: "#",
			icon: FileDocIcon,
		},
	],
};

let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<CirclesFourIcon class="!size-5" />
							<span class="text-base font-semibold">Acme Inc.</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavDocuments items={data.documents} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
