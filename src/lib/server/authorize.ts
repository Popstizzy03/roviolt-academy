import { error } from "@sveltejs/kit";
import { student, instructor, editor, moderator, admin } from "./permissions";

const roles: Record<string, typeof student> = {
	student,
	instructor,
	editor,
	moderator,
	admin,
};

export function can(
	user: { role?: string | null },
	resource: string,
	action: string,
) {
	const role = roles[user.role ?? "student"];
	if (!role) return false;
	return role.authorize({ [resource]: [action] }).success;
}

export function requireCan(
	user: { role?: string | null },
	resource: string,
	action: string,
) {
	if (!can(user, resource, action)) {
		error(403, "Insufficient permissions");
	}
}
