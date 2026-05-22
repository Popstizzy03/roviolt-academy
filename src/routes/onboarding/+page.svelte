<script lang="ts">
import { Button } from "$lib/components/ui/button/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { enhance } from "$app/forms";

let step = $state(0);
let displayName = $state("");
let bio = $state("");
let interests = $state("");
let specialty = $state("");
let skillLevel = $state("");

let acceptedTerms = $state(false);
let acceptedPrivacy = $state(false);
let marketingOptIn = $state(false);

function next() {
	if (step < 4) step++;
}

function back() {
	if (step > 0) step--;
}

const totalSteps = 4;
</script>

<div class="mx-auto flex min-h-svh max-w-lg flex-col justify-center px-4 py-12">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Complete your profile</h1>
		<span class="text-sm text-muted-foreground">Step {step + 1} of {totalSteps + 1}</span>
	</div>

	<div class="mb-6 h-2 w-full rounded-full bg-muted">
		<div
			class="h-2 rounded-full bg-primary transition-all"
			style="width: {((step + 1) / (totalSteps + 1)) * 100}%"
		></div>
	</div>

	<form method="POST" action="?/complete" use:enhance>
		{#if step === 0}
			<div class="space-y-4">
				<h2 class="text-lg font-semibold">Legal & Communications</h2>
				<label class="flex items-start gap-3">
					<input type="checkbox" bind:checked={acceptedTerms} required />
					<span class="text-sm">
						I accept the <a href="/terms" class="underline" target="_blank">Terms & Conditions</a>
					</span>
				</label>
				<label class="flex items-start gap-3">
					<input type="checkbox" bind:checked={acceptedPrivacy} required />
					<span class="text-sm">
						I accept the <a href="/privacy" class="underline" target="_blank">Privacy Policy</a>
					</span>
				</label>
				<label class="flex items-start gap-3">
					<input type="checkbox" bind:checked={marketingOptIn} />
					<span class="text-sm">
						I agree to receive <a href="/marketing" class="underline" target="_blank">marketing communications</a>
					</span>
				</label>
			</div>
		{/if}

		{#if step === 1}
			<div class="space-y-4">
				<div>
					<label for="displayName" class="mb-1 block text-sm font-medium">Display Name</label>
					<input
						id="displayName"
						name="displayName"
						placeholder="Your display name"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						bind:value={displayName}
						required
					/>
				</div>
				<div>
					<label for="bio" class="mb-1 block text-sm font-medium">Bio</label>
					<textarea
						id="bio"
						name="bio"
						placeholder="Tell us about yourself"
						rows="4"
						class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						bind:value={bio}
					></textarea>
				</div>
			</div>
		{/if}

		{#if step === 2}
			<div class="space-y-4">
				<div>
					<label for="interests" class="mb-1 block text-sm font-medium">What are you interested in?</label>
					<input
						id="interests"
						name="interests"
						placeholder="e.g. Programming, Design, Music"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						bind:value={interests}
					/>
					<p class="mt-1 text-xs text-muted-foreground">Comma-separated list of your interests</p>
				</div>
				<div>
					<label for="specialty" class="mb-1 block text-sm font-medium">What is your Specialty?</label>
					<input
						id="specialty"
						name="specialty"
						placeholder="e.g. Graphic Design, Web Development, Data Science"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						bind:value={specialty}
					/>
				</div>
			</div>
		{/if}

		{#if step === 3}
			<div class="space-y-4">
				<div>
					<label for="skillLevel" class="mb-1 block text-sm font-medium">What is you speciality Skill Level?</label>
					<select
						id="skillLevel"
						name="skillLevel"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						bind:value={skillLevel}
						required
					>
						<option value="" disabled>Select your level</option>
						<option value="beginner">Beginner</option>
						<option value="intermediate">Intermediate</option>
						<option value="advanced">Advanced</option>
						<option value="expert">Expert</option>
					</select>
				</div>
				<input type="hidden" name="displayName" value={displayName} />
				<input type="hidden" name="bio" value={bio} />
				<input type="hidden" name="interests" value={interests} />
				<input type="hidden" name="specialty" value={specialty} />
				<input type="hidden" name="acceptedTerms" value={String(acceptedTerms)} />
				<input type="hidden" name="acceptedPrivacy" value={String(acceptedPrivacy)} />
				<input type="hidden" name="marketingOptIn" value={String(marketingOptIn)} />
			</div>
		{/if}

		<div class="mt-8 flex gap-3">
			{#if step > 0}
				<Button type="button" variant="outline" onclick={back} class="flex-1">Back</Button>
			{/if}

			{#if step < 3}
				<Button type="button" onclick={next} class="flex-1">Continue</Button>
			{:else}
				<Button type="submit" class="flex-1">Complete</Button>
			{/if}
		</div>
	</form>
</div>
