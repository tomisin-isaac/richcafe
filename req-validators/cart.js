import * as yup from "yup";

export const addCartItemSchema = yup
	.object({
		productId: yup.string().trim().required(),
		sizeId: yup.string().trim().required(),
		quantity: yup.number().integer().min(1).max(50).default(1),
	})
	.noUnknown(true);

export const updateCartItemSchema = yup
	.object({
		quantity: yup.number().integer().min(0).max(50).required(),
	})
	.noUnknown(true);

export function yupErrorToDetails(err) {
	if (!err?.inner?.length) return null;
	const details = {};
	for (const e of err.inner)
		if (e.path && !details[e.path]) details[e.path] = e.message;
	return details;
}
