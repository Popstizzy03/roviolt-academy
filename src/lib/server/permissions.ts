import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";
import { checkCourseAccess } from "$lib/server/access";

const statement = {
	...defaultStatements,
	course: ["create", "read", "update", "delete", "approve", "reject"],
	lesson: ["create", "read", "update", "delete"],
	enrollment: ["purchase", "access"],
	review: ["create", "read", "delete"],
	certification: ["earn"],
	earning: ["read"],
	content: ["flag", "remove"],
	system: ["configure"],
} as const;

export const ac = createAccessControl(statement);

const studentStmts = {
	course: ["read"],
	lesson: ["read"],
	enrollment: ["purchase", "access"],
	review: ["create", "read"],
	certification: ["earn"],
} as const;

export const student = ac.newRole(studentStmts);

const instructorStmts = {
	...studentStmts,
	course: ["create", "read", "update"],
	lesson: ["create", "read", "update"],
	earning: ["read"],
} as const;

export const instructor = ac.newRole(instructorStmts);

const editorStmts = {
	...instructorStmts,
	course: ["create", "read", "update", "approve", "reject"],
	lesson: ["create", "read", "update", "delete"],
} as const;

export const editor = ac.newRole(editorStmts);

const moderatorStmts = {
	...instructorStmts,
	user: ["get", "list", "ban"],
	review: ["create", "read", "delete"],
	content: ["flag", "remove"],
} as const;

export const moderator = ac.newRole(moderatorStmts);

const adminStmts = {
	...editorStmts,
	...moderatorStmts,
	...adminAc.statements,
	system: ["configure"],
} as const;

export const admin = ac.newRole(adminStmts);

const BYPASS_ROLES = ["admin", "instructor", "editor"];

export async function canAccessCourse(
	userId: string,
	courseId: string,
	role?: string,
) {
	if (role && BYPASS_ROLES.includes(role)) return true;
	const result = await checkCourseAccess(userId, courseId);
	return result.allowed;
}
