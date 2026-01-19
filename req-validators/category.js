import * as yup from "yup";

export const createCategorySchema = yup
	.object({
		name: yup.string().trim().required(),
		image: yup.string().trim().default(""),
	})
	.noUnknown(true);

export const updateCategorySchema = yup
	.object({
		name: yup.string().trim().optional(),
		image: yup.string().trim().optional(),
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
