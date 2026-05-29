<script lang="ts">
import { page } from "$app/state";
import { locales, localizeHref } from "$lib/paraglide/runtime";
import "./layout.css";
import { ModeWatcher } from "mode-watcher";
import { initUserSession } from "$lib/client/state/user.svelte";

let { data, children } = $props();
const sessionState = initUserSession(data.user, data.session);

$effect(() => {
	sessionState.update(data.user, data.session);
});
</script>

<svelte:head>
	<link
		rel="icon"
		type="image/png"
		sizes="32x32"
		href="/favicon_io/favicon-32x32.png"
	/>

	<link
		rel="icon"
		type="image/png"
		sizes="16x16"
		href="/favicon_io/favicon-16x16.png"
	/>

	<link rel="shortcut icon" href="/favicon_io/favicon.ico" />

	<link
		rel="apple-touch-icon"
		sizes="180x180"
		href="/favicon_io/apple-touch-icon.png"
	/>

	<link rel="manifest" href="/favicon_io/site.webmanifest" />
</svelte:head>

<ModeWatcher />
{@render children()}

<div style="display:none">
	{#each locales as locale (locale)}
		<a
			href={localizeHref(page.url.pathname, { locale })}
		>{locale}</a>
	{/each}
</div>
