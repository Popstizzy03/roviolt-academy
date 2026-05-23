<script lang="ts">
import { enhance } from "$app/forms";
import { resolve } from "$app/paths";
import { Button } from "$lib/components/ui/button/index.js";
import * as Field from "$lib/components/ui/field/index.js";
import { Input } from "$lib/components/ui/input/index.js";
import { Spinner } from "$lib/components/ui/spinner/index.js";
import { cn } from "$lib/utils.js";

let {
	class: className,
	action = "?/signUpEmail",
	...restProps
}: {
	class?: string;
	action?: string;
} & { [key: string]: unknown } = $props();

let submitting = $state<string | null>(null);

function handleEnhance({ submitter }: { submitter: HTMLElement | null }) {
	const btn = submitter as HTMLButtonElement | null;
	let key = "email";
	if (btn?.value) {
		key = btn.value;
	}
	submitting = key;
	return async ({ update }: { update: () => void }) => {
		submitting = null;
		update();
	};
}
</script>

<form action={action} method="POST" class={cn("flex flex-col gap-6", className)} use:enhance={handleEnhance} {...restProps}>
	<Field.Group>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">Create your account</h1>
			<p class="text-muted-foreground text-sm text-balance">
				Fill in the form below to create your account
			</p>
		</div>
		<Field.Field>
			<Field.Label for="name">Full Name</Field.Label>
			<Input id="name" name="name" type="text" placeholder="John Doe" required />
		</Field.Field>
		<Field.Field>
			<Field.Label for="email">Email</Field.Label>
			<Input id="email" name="email" type="email" placeholder="m@example.com" required />
			<Field.Description>
				We'll use this to contact you. We will not share your email with anyone else.
			</Field.Description>
		</Field.Field>
		<Field.Field>
			<Field.Label for="password">Password</Field.Label>
			<Input id="password" name="password" type="password" required />
			<Field.Description>Must be at least 8 characters long.</Field.Description>
		</Field.Field>
		<Field.Field>
			<Field.Label for="confirm-password">Confirm Password</Field.Label>
			<Input id="confirm-password" name="confirmPassword" type="password" required />
			<Field.Description>Please confirm your password.</Field.Description>
		</Field.Field>
		<Field.Field>
			<Button type="submit" disabled={submitting !== null}>
				{#if submitting === "email"}<Spinner />{/if}
				Create Account
			</Button>
		</Field.Field>
		<Field.Separator>Or continue with</Field.Separator>
		<Field.Field>
			<Button variant="outline" type="submit" formaction="?/signInSocial" name="provider" value="github" formnovalidate disabled={submitting !== null}>
				{#if submitting === "github"}<Spinner />{/if}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<path
						d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
						fill="currentColor"
					/>
				</svg>
				Sign up with GitHub
			</Button>
			<Button variant="outline" type="submit" formaction="?/signInSocial" name="provider" value="google" formnovalidate disabled={submitting !== null}>
				{#if submitting === "google"}<Spinner />{/if}
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
					<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
					<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
					<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
					<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
				</svg>
				Sign up with Google
			</Button>
			<Field.Description class="px-6 text-center">
				Already have an account? <a href={resolve("/signin")}>Sign in</a>
			</Field.Description>
		</Field.Field>
	</Field.Group>
</form>
