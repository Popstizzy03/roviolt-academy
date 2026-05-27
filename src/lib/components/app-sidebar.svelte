<script lang="ts">
import BookOpenIcon from "phosphor-svelte/lib/BookOpen";
import ChartBarHorizontalIcon from "phosphor-svelte/lib/ChartBarHorizontal";
import SquaresFourIcon from "phosphor-svelte/lib/SquaresFour";
import FileDocIcon from "phosphor-svelte/lib/FileDoc";
import FolderIcon from "phosphor-svelte/lib/Folder";
import QuestionIcon from "phosphor-svelte/lib/Question";
import CircleIcon from "phosphor-svelte/lib/Circle";
import ClipboardTextIcon from "phosphor-svelte/lib/ClipboardText";
import MagnifyingGlassIcon from "phosphor-svelte/lib/MagnifyingGlass";
import GearIcon from "phosphor-svelte/lib/Gear";
import UsersIcon from "phosphor-svelte/lib/Users";
import NavDocuments from "./nav-documents.svelte";
import NavMain from "./nav-main.svelte";
import NavSecondary from "./nav-secondary.svelte";
import NavUser from "./nav-user.svelte";
import * as Sidebar from "$lib/components/ui/sidebar/index.js";
import type { ComponentProps } from "svelte";

const data = {
	navMain: [
		{
			title: "Dashboard",
			url: "/dashboard",
			icon: SquaresFourIcon,
		},
		{
			title: "Courses",
			url: "/courses",
			icon: BookOpenIcon,
		},
		{
			title: "Analytics",
			url: "#",
			icon: ChartBarHorizontalIcon,
		},
		{
			title: "Settings",
			url: "/dashboard/settings",
			icon: GearIcon,
		},
		{
			title: "Admin",
			url: "/admin",
			icon: UsersIcon,
		},
	],
	navSecondary: [
		{
			title: "Get Help",
			url: "/help",
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
			name: "Documents",
			url: "#",
			icon: FileDocIcon,
		},
		{
			name: "Reports",
			url: "#",
			icon: ClipboardTextIcon,
		},
		{
			name: "Resources",
			url: "#",
			icon: FolderIcon,
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
						<a href="/" {...props}>
							<CircleIcon class="!size-5" />
							<span class="text-base font-semibold">Roviolt Academy</span>
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
		<NavUser />
	</Sidebar.Footer>
</Sidebar.Root>
