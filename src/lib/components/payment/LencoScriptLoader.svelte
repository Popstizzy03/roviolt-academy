<script lang="ts">
interface Props {
	onloaded?: () => void;
	onerror?: () => void;
}

let { onloaded, onerror }: Props = $props();

function loadScript() {
	if (typeof window === "undefined") return;
	if (window.LencoPay) {
		onloaded?.();
		return;
	}

	const script = document.createElement("script");
	script.src = "https://pay.lenco.co/js/v1/inline.js";
	script.async = true;
	script.onload = () => pollForReady();
	script.onerror = () => {
		onerror?.();
	};
	document.head.appendChild(script);
}

function pollForReady() {
	let elapsed = 0;
	const interval = setInterval(() => {
		elapsed += 100;
		if (window.LencoPay) {
			clearInterval(interval);
			onloaded?.();
		} else if (elapsed >= 12_000) {
			clearInterval(interval);
			onerror?.();
		}
	}, 100);
}

$effect(() => {
	if (typeof window !== "undefined") {
		loadScript();
	}
});
</script>
