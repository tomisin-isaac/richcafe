import * as yup from "yup";

export const signupSchema = yup
	.object({
		name: yup.string().trim().required(),
		email: yup.string().trim().lowercase().email().required(),
		phone: yup.string().trim().min(11).max(11).required(),
		password: yup.string().min(6).required(),
	})
	.noUnknown(true);

export const loginSchema = yup
	.object({
		email: yup.string().trim().lowercase().email().required(),
		password: yup.string().required(),
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

export function publicUser(userDoc) {
	return {
		id: String(userDoc._id),
		name: userDoc.name ?? "",
		email: userDoc.email,
		phone: userDoc.phone,
		profilePicture: userDoc.profilePicture,
		createdAt: userDoc.createdAt,
	};
}
