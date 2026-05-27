import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session) {
		throw error(401, "Authentication required");
	}

	const { code, errorMessage, taskPrompt } = (await request.json()) as {
		code: string;
		errorMessage: string;
		taskPrompt: string;
	};

	try {
		const response = await fetch(
			"https://integrate.api.nvidia.com/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${env.NVIDIA_NIM_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "meta/llama3-70b-instruct",
					messages: [
						{
							role: "system",
							content:
								"You are Roviolt AI, an elite gamified coding coach. Provide concise, friendly hints to help the student solve their compilation/logic error. DO NOT give them the direct copy-paste answer outright; guide them on how to fix it.",
						},
						{
							role: "user",
							content: `Challenge Prompt: ${taskPrompt}\nStudent Code:\`\`\`\n${code}\n\`\`\`\nError Message:\n${errorMessage}`,
						},
					],
					max_tokens: 250,
					temperature: 0.2,
				}),
			},
		);

		const data = (await response.json()) as {
			choices: Array<{ message: { content: string } }>;
		};
		return json({ hint: data.choices[0].message.content });
	} catch {
		throw error(500, "Failed to contact AI tutor service");
	}
};
