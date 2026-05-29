import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ locals }) => {
	// 1. Strict Authorization Gate
	if (!locals.session || !locals.user) {
		throw error(401, "Authentication required");
	}

	// Ensure only authorized roles can upload heavy media
	if (locals.user.role !== "instructor" && locals.user.role !== "admin") {
		throw error(403, "Insufficient permissions to upload course media");
	}

	try {
		// 2. Request a direct upload URL from Cloudflare Stream
		const response = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/direct_upload`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					// Enforce a maximum length (e.g., 2 hours) to prevent abuse
					maxDurationSeconds: 7200,
					// Tag the video with the creator's ID for internal tracking
					creator: locals.user.id,
					// Optional: Add watermarks or restrict viewing to your domain here
					requireSignedURLs: true,
				}),
			},
		);

		const data = await response.json();

		if (!data.success) {
			console.error("[Cloudflare Stream Error]", data.errors);
			throw error(
				502,
				"Failed to negotiate upload lease with streaming provider",
			);
		}

		// 3. Return the upload URL and the unique video ID to the client
		return json({
			uploadUrl: data.result.uploadURL,
			uid: data.result.uid,
		});
	} catch (err) {
		console.error("[Stream API Exception]", err);
		throw error(500, "Internal media processing exception");
	}
};
