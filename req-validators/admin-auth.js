import * as yup from "yup";

export const adminLoginSchema = yup
	.object({
		email: yup.string().trim().lowercase().email().required(),
		password: yup.string().required(),
	})
	.noUnknown(true);

export const adminBootstrapSchema = yup
	.object({
		name: yup.string().trim().default("Owner"),
		email: yup.string().trim().lowercase().email().required(),
		password: yup.string().min(6).required(),
		phone: yup.string().trim().default(""),
	})
	.noUnknown(true);

export function yupErrorToDetails(err) {
	if (!err?.inner?.length) return null;
	const details = {};
	for (const e of err.inner) {
		if (e.path && !details[e.path]) details[e.path] = e.message;
	}
	return details;
}

export function publicAdmin(adminDoc) {
	return {
		id: String(adminDoc._id),
		name: adminDoc.name ?? "",
		email: adminDoc.email,
		phone: adminDoc.phone ?? "",
		role: adminDoc.role,
		isActive: adminDoc.isActive,
		lastLoginAt: adminDoc.lastLoginAt ?? null,
		createdAt: adminDoc.createdAt,
	};
}
