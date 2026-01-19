import dbConnect from "../utils/mongodb";
import Product from "../models/Product";
import Category from "../models/Category";

/**
 * Create a category
 */
export async function createCategoryService({ name, image }) {
	await dbConnect();

	const cleanName = name.trim();

	const existing = await Category.findOne({ name: cleanName });
	if (existing) {
		const err = new Error("CATEGORY_NAME_ALREADY_EXISTS");
		err.status = 409;
		throw err;
	}

	const category = await Category.create({
		name: cleanName,
		image: (image || "").trim(),
	});

	return category;
}

/**
 * List categories
 */
export async function listCategoriesService() {
	await dbConnect();
	return Category.find().sort({ createdAt: -1 });
}

/**
 * Get a single category by id
 */
export async function getCategoryByIdService(categoryId) {
	await dbConnect();

	const category = await Category.findById(categoryId);
	if (!category) {
		const err = new Error("CATEGORY_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	return category;
}

/**
 * Update a category
 */
export async function updateCategoryService(categoryId, updates) {
	await dbConnect();

	const patch = {};
	if (typeof updates.name === "string") patch.name = updates.name.trim();
	if (typeof updates.image === "string") patch.image = updates.image.trim();

	if (patch.name) {
		const dup = await Category.findOne({
			name: patch.name,
			_id: { $ne: categoryId },
		});
		if (dup) {
			const err = new Error("CATEGORY_NAME_ALREADY_EXISTS");
			err.status = 409;
			throw err;
		}
	}

	const category = await Category.findByIdAndUpdate(categoryId, patch, {
		new: true,
	});
	if (!category) {
		const err = new Error("CATEGORY_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	return category;
}

/**
 * Delete a category
 * (safety) refuse if products exist under this category
 */
export async function deleteCategoryService(categoryId) {
	await dbConnect();

	const productCount = await Product.countDocuments({ category: categoryId });
	if (productCount > 0) {
		const err = new Error("CATEGORY_HAS_PRODUCTS");
		err.status = 409;
		throw err;
	}

	const category = await Category.findByIdAndDelete(categoryId);
	if (!category) {
		const err = new Error("CATEGORY_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	return category;
}
