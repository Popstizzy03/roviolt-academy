import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { getStorage } from "$lib/server/storage";
import { requireCan } from "$lib/server/authorize";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session || !locals.user) {
		throw error(401, "Authentication required");
	}

	requireCan(locals.user, "course", "create");

	const { filename, contentType, size } = await request.json();

	if (!filename || !contentType || typeof size !== "number") {
		throw error(400, "Missing required fields: filename, contentType, size");
	}

	try {
		const result = await getStorage().getUploadUrl({
			filename,
			contentType,
			size,
		});
		return json(result);
	} catch (err) {
		if (err instanceof Error && err.message.includes("exceeds maximum")) {
			throw error(400, err.message);
		}
		throw error(500, "Failed to generate upload URL");
	}
};
