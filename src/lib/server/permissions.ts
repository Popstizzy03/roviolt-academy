import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statement = {
	...defaultStatements,
	course: ["create", "read", "update", "delete"],
	lesson: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
	course: ["create", "read", "update", "delete"],
	lesson: ["create", "read", "update", "delete"],
	...adminAc.statements,
});

export const instructor = ac.newRole({
	course: ["create", "read", "update"],
	lesson: ["create", "read", "update"],
	user: ["get"],
});

export const editor = ac.newRole({
	course: ["read", "update"],
	lesson: ["create", "read", "update", "delete"],
});

export const moderator = ac.newRole({
	user: ["get", "list", "ban"],
});

export const student = ac.newRole({
	course: ["read"],
	lesson: ["read"],
});
