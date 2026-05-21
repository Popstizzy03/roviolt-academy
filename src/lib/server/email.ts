import { Resend } from "resend";
import { env } from "$env/dynamic/private";

const resend = new Resend(env.RESEND_API_KEY);

const FROM = env.EMAIL_FROM || "onboarding@resend.dev";

export async function sendVerificationEmail(params: {
	email: string;
	url: string;
	token: string;
}) {
	const { email, url } = params;

	const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; padding: 2rem;">
	<h1>Verify your email</h1>
	<p>Click the button below to verify your email address.</p>
	<a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Verify email</a>
	<p style="margin-top: 1.5rem; color: #666;">If you did not create an account, you can ignore this email.</p>
</body>
</html>`;

	await resend.emails.send({
		from: FROM,
		to: email,
		subject: "Verify your email",
		html,
	});
}

export async function sendResetPasswordEmail(params: {
	email: string;
	url: string;
	token: string;
}) {
	const { email, url } = params;

	const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; padding: 2rem;">
	<h1>Reset your password</h1>
	<p>Click the button below to reset your password.</p>
	<a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset password</a>
	<p style="margin-top: 1.5rem; color: #666;">If you did not request a password reset, you can ignore this email.</p>
</body>
</html>`;

	await resend.emails.send({
		from: FROM,
		to: email,
		subject: "Reset your password",
		html,
	});
}

export async function sendAccountDeletionConfirmation(params: {
	email: string;
}) {
	const { email } = params;

	const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; padding: 2rem;">
	<h1>Account Deletion Scheduled</h1>
	<p>Your account has been scheduled for permanent deletion.</p>
	<p>You have <strong>30 days</strong> to cancel this by signing back in. After that, your account and all associated data will be permanently removed.</p>
	<p style="margin-top: 1.5rem; color: #666;">If you did not request this, you can ignore this email and your account will remain active.</p>
</body>
</html>`;

	await resend.emails.send({
		from: FROM,
		to: email,
		subject: "Account deletion scheduled — 30-day grace period",
		html,
	});
}

export async function sendAccountRestored(params: { email: string }) {
	const { email } = params;

	const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: system-ui, sans-serif; padding: 2rem;">
	<h1>Account Restored</h1>
	<p>Your account has been restored. The scheduled deletion has been cancelled.</p>
	<p>You can continue using the platform as normal.</p>
</body>
</html>`;

	await resend.emails.send({
		from: FROM,
		to: email,
		subject: "Your account has been restored",
		html,
	});
}
