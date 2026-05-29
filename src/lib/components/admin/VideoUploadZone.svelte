<script lang="ts">
let {
	onUploadSuccess,
	onUploadError,
}: {
	onUploadSuccess?: (uid: string) => void;
	onUploadError?: (message: string) => void;
} = $props();

// Reactive State Declarations via Runes
let file = $state<File | null>(null);
let isUploading = $state(false);
let progressPercentage = $state(0);
let byteVelocity = $state("");
let uploadError = $state<string | null>(null);
let activeXhr = $state<XMLHttpRequest | null>(null);

// Derived Performance Metrics (Automatically updates when source variables shift)
let isSubmitDisabled = $derived(!file || isUploading);
let formattedSize = $derived(
	file ? (file.size / (1024 * 1024)).toFixed(2) + " MB" : "0 MB",
);

/**
 * Intercepts the file drop/selection event
 */
function handleFileSelection(event: Event) {
	const target = event.target as HTMLInputElement;
	if (target.files && target.files.length > 0) {
		const selectedFile = target.files[0];

		// Enforce sanity constraints before negotiating with the server
		if (!selectedFile.type.startsWith("video/")) {
			uploadError =
				"Invalid media type. Please select a valid video format (.mp4, .mov, .mkv).";
			return;
		}

		uploadError = null;
		file = selectedFile;
		progressPercentage = 0;
	}
}

/**
 * Executes the direct upload loop using XHR to stream raw binary segments
 */
async function initiateUploadPipeline() {
	if (!file) return;

	isUploading = true;
	uploadError = null;
	progressPercentage = 0;
	const startTime = Date.now();

	try {
		// Step 1: Lease an isolated upload asset signature from our SvelteKit boundary
		const tokenResponse = await fetch("/api/storage/storage/stream/upload", {
			method: "POST",
		});

		if (!tokenResponse.ok) {
			throw new Error(
				`Failed to provision an upload lease: ${tokenResponse.statusText}`,
			);
		}

		const { uploadUrl, uid } = await tokenResponse.json();

		// Step 2: Establish the XHR Stream Tunnel to Cloudflare Edge
		const xhr = new XMLHttpRequest();
		activeXhr = xhr;

		xhr.open("POST", uploadUrl, true);

		// Monitor upload state in real-time
		xhr.upload.onprogress = (event) => {
			if (event.lengthComputable) {
				// 1. Calculate percentage completeness
				progressPercentage = Math.round((event.loaded / event.total) * 100);

				// 2. Compute upload metrics (Velocity tracking)
				const durationInSeconds = (Date.now() - startTime) / 1000;
				const bytesPerSecond = event.loaded / durationInSeconds;
				const mbPerSecond = (bytesPerSecond / (1024 * 1024)).toFixed(2);
				byteVelocity = `${mbPerSecond} MB/s`;
			}
		};

		// Handle termination sequences
		xhr.onload = () => {
			isUploading = false;
			activeXhr = null;

			// Cloudflare Stream returns HTTP 200 or 201 when the transmission pipeline locks correctly
			if (xhr.status >= 200 && xhr.status < 300) {
				progressPercentage = 100;
				onUploadSuccess?.(uid);
			} else {
				const errorText = `Cloudflare ingestion error code [${xhr.status}]: ${xhr.responseText}`;
				uploadError = "Transmission rejected by the stream cluster engine.";
				onUploadError?.(errorText);
			}
		};

		xhr.onerror = () => {
			isUploading = false;
			activeXhr = null;
			uploadError = "Network connection failed during streaming transfer.";
			onUploadError?.("Fatal XHR network error occurred.");
		};

		// Step 3: Bundle file as formal multipart form-data as required by Cloudflare Direct Creator Uploads
		const formData = new FormData();
		formData.append("file", file);

		// Start pumping the binary streams over HTTP
		xhr.send(formData);
	} catch (err: unknown) {
		isUploading = false;
		activeXhr = null;
		const message =
			err instanceof Error
				? err.message
				: "An exception occurred inside the media upload worker.";
		uploadError = message;
		onUploadError?.(message);
	}
}

/**
 * Allows the user to abort an active upload mid-flight safely clearing resources
 */
function abortActiveUpload() {
	if (activeXhr) {
		activeXhr.abort();
		activeXhr = null;
		isUploading = false;
		progressPercentage = 0;
		uploadError = "Upload terminated by operator.";
	}
}
</script>

<div class="w-full max-w-xl mx-auto bg-card border rounded-xl shadow-xs p-6 space-y-6">
	<div class="space-y-2">
		<h3 class="text-lg font-semibold tracking-tight text-foreground">Video Asset Ingestion</h3>
		<p class="text-sm text-muted-foreground">Upload course lectures directly to Cloudflare HLS streaming nodes.</p>
	</div>

	<label 
		class="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-all bg-muted/20 hover:bg-muted/40 {isUploading ? 'opacity-50 pointer-events-none' : 'border-input'}"
	>
		<div class="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
			<svg class="w-8 h-8 mb-3 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
				<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
			</svg>
			{#if file}
				<p class="text-sm font-medium text-foreground truncate max-w-xs">{file.name}</p>
				<p class="text-xs text-muted-foreground mt-1">{formattedSize}</p>
			{:else}
				<p class="text-sm text-muted-foreground"><span class="font-semibold text-primary">Click to select</span> or drag files here</p>
				<p class="text-xs text-muted-foreground mt-1">High Definition MP4 or MOV preferred</p>
			{/if}
		</div>
		<input 
			type="file" 
			accept="video/*" 
			class="hidden" 
			disabled={isUploading} 
			onchange={handleFileSelection} 
		/>
	</label>

	{#if isUploading || progressPercentage > 0}
		<div class="space-y-2 bg-muted/40 p-4 rounded-lg border border-border">
			<div class="flex justify-between text-xs font-mono text-muted-foreground">
				<span class="font-medium text-foreground">{isUploading ? "Streaming Bytes..." : "Upload Complete"}</span>
				<span>{progressPercentage}%</span>
			</div>
			
			<div class="w-full bg-secondary rounded-full h-2 overflow-hidden">
				<div 
					class="bg-primary h-full rounded-full transition-all duration-150 ease-out" 
					style="width: {progressPercentage}%"
				></div>
			</div>

			{#if isUploading}
				<div class="flex justify-between items-center pt-1 text-xs text-muted-foreground font-mono">
					<span>Velocity: {byteVelocity}</span>
					<button 
						type="button" 
						onclick={abortActiveUpload}
						class="text-destructive hover:underline font-sans cursor-pointer font-medium"
					>
						Cancel Upload
					</button>
				</div>
			{/if}
		</div>
	{/if}

	{#if uploadError}
		<div class="p-3 bg-destructive/15 border border-destructive/20 text-destructive text-sm rounded-lg flex items-start gap-2">
			<svg class="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
			<span>{uploadError}</span>
		</div>
	{/if}

	<button
		type="button"
		disabled={isSubmitDisabled}
		onclick={initiateUploadPipeline}
		class="w-full flex items-center justify-center px-4 h-10 text-sm font-medium text-primary-foreground bg-primary rounded-lg transition-colors hover:bg-primary/90 focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
	>
		{#if isUploading}
			<span class="flex items-center gap-2">
				<svg class="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>
				Transmitting Media Array...
			</span>
		{:else}
			Upload Media Track
		{/if}
	</button>
</div>