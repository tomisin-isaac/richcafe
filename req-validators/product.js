import * as yup from "yup";

const sizeSchema = yup.object({
	name: yup.string().trim().required(),
	price: yup.number().integer().min(0).required(),
	isAvailable: yup.boolean().default(true),
});

const addonItemSchema = yup.object({
	product: yup.string().trim().required(), // ObjectId string
	isActive: yup.boolean().default(true),
	sortOrder: yup.number().integer().default(0),
});

const addonGroupSchema = yup.object({
	name: yup.string().trim().required(),
	isActive: yup.boolean().default(true),
	sortOrder: yup.number().integer().default(0),
	items: yup.array().of(addonItemSchema).default([]),
});

export const createProductSchema = yup
	.object({
		name: yup.string().trim().required(),
		category: yup.string().trim().required(), // ObjectId string
		sizes: yup.array().of(sizeSchema).min(1).required(),
		preparationTimeMinutes: yup.number().integer().min(1).max(300).required(),
		isAvailable: yup.boolean().default(true),
		images: yup.array().of(yup.string().trim()).default([]),
		addonGroups: yup.array().of(addonGroupSchema).default([]),
	})
	.noUnknown(true);

export const updateProductSchema = yup
	.object({
		name: yup.string().trim().optional(),
		category: yup.string().trim().optional(),
		sizes: yup.array().of(sizeSchema).min(1).optional(),
		preparationTimeMinutes: yup.number().integer().min(1).max(300).optional(),
		isAvailable: yup.boolean().optional(),
		images: yup.array().of(yup.string().trim()).optional(),
		addonGroups: yup.array().of(addonGroupSchema).optional(),
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
