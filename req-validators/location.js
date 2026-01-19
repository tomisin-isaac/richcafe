import * as yup from "yup";

export const createLocationSchema = yup
	.object({
		name: yup.string().trim().required(),
		dayDeliveryFee: yup.number().integer().min(0).required(),
		nightDeliveryFee: yup.number().integer().min(0).required(),
		isActive: yup.boolean().default(true),
		sortOrder: yup.number().integer().default(0),
	})
	.noUnknown(true);

export const updateLocationSchema = yup
	.object({
		name: yup.string().trim().optional(),
		dayDeliveryFee: yup.number().integer().min(0).optional(),
		nightDeliveryFee: yup.number().integer().min(0).optional(),
		isActive: yup.boolean().optional(),
		sortOrder: yup.number().integer().optional(),
	})
	.noUnknown(true);

export function yupErrorToDetails(err) {
	if (!err?.inner?.length) return null;
	const details = {};
	for (const e of err.inner)
		if (e.path && !details[e.path]) details[e.path] = e.message;
	return details;
}
