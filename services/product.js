import mongoose from "mongoose";
import dbConnect from "../utils/mongodb";
import Product from "../models/Product";
import Category from "../models/Category";

function assertObjectId(id, code = "INVALID_ID") {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		const err = new Error(code);
		err.status = 400;
		throw err;
	}
}

function uniqLower(arr) {
	return new Set(arr.map((s) => String(s).trim().toLowerCase()));
}

function cleanImages(images) {
	if (!Array.isArray(images)) return [];
	return images.map((x) => String(x).trim()).filter(Boolean);
}

function collectAddonProductIds(addonGroups = []) {
	const ids = [];
	for (const g of addonGroups || []) {
		for (const it of g?.items || []) {
			if (it?.product) ids.push(String(it.product));
		}
	}
	return ids;
}

async function ensureCategoryExists(categoryId) {
	assertObjectId(categoryId, "INVALID_CATEGORY_ID");
	const exists = await Category.exists({ _id: categoryId });
	if (!exists) {
		const err = new Error("CATEGORY_NOT_FOUND");
		err.status = 404;
		throw err;
	}
}

async function ensureAddonProductsExist(addonProductIds) {
	const ids = Array.from(new Set(addonProductIds));
	for (const id of ids) assertObjectId(id, "INVALID_ADDON_PRODUCT_ID");

	if (ids.length === 0) return;

	const found = await Product.find({ _id: { $in: ids } }).select("_id");
	if (found.length !== ids.length) {
		const err = new Error("ADDON_PRODUCT_NOT_FOUND");
		err.status = 404;
		throw err;
	}
}

function validateSizesUnique(sizes) {
	const names = sizes.map((s) => s.name);
	const set = uniqLower(names);
	if (set.size !== names.length) {
		const err = new Error("DUPLICATE_SIZE_NAME");
		err.status = 400;
		throw err;
	}
}

export async function createProductService(payload) {
	await dbConnect();

	await ensureCategoryExists(payload.category);

	validateSizesUnique(payload.sizes);

	const addonIds = collectAddonProductIds(payload.addonGroups);
	await ensureAddonProductsExist(addonIds);

	const product = await Product.create({
		name: payload.name.trim(),
		category: payload.category,
		sizes: payload.sizes.map((s) => ({
			name: s.name.trim(),
			price: s.price,
			isAvailable: typeof s.isAvailable === "boolean" ? s.isAvailable : true,
		})),
		preparationTimeMinutes: payload.preparationTimeMinutes,
		isAvailable:
			typeof payload.isAvailable === "boolean" ? payload.isAvailable : true,
		images: cleanImages(payload.images),
		addonGroups: (payload.addonGroups || []).map((g) => ({
			name: g.name.trim(),
			isActive: typeof g.isActive === "boolean" ? g.isActive : true,
			sortOrder: Number.isInteger(g.sortOrder) ? g.sortOrder : 0,
			items: (g.items || []).map((it) => ({
				product: it.product,
				isActive: typeof it.isActive === "boolean" ? it.isActive : true,
				sortOrder: Number.isInteger(it.sortOrder) ? it.sortOrder : 0,
			})),
		})),
	});

	// populate for response
	const full = await Product.findById(product._id)
		.populate("category", "name image")
		.populate("addonGroups.items.product", "name images sizes isAvailable");

	return full;
}

export async function listProductsService({ category, available, q } = {}) {
	await dbConnect();

	const filter = {};
	if (category) {
		assertObjectId(category, "INVALID_CATEGORY_ID");
		filter.category = category;
	}
	if (available === "true") filter.isAvailable = true;
	if (available === "false") filter.isAvailable = false;

	if (q) {
		filter.name = { $regex: String(q).trim(), $options: "i" };
	}

	return Product.find(filter)
		.sort({ createdAt: -1 })
		.populate("category", "name image")
		.populate("addonGroups.items.product", "name images sizes isAvailable");
}

export async function getProductByIdService(productId) {
	await dbConnect();
	assertObjectId(productId);

	const product = await Product.findById(productId)
		.populate("category", "name image")
		.populate("addonGroups.items.product", "name images sizes isAvailable");

	if (!product) {
		const err = new Error("PRODUCT_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	return product;
}

export async function updateProductService(productId, updates) {
	await dbConnect();
	console.log(productId);
	assertObjectId(productId);

	if (updates.category) await ensureCategoryExists(updates.category);
	if (updates.sizes) validateSizesUnique(updates.sizes);

	if (updates.addonGroups) {
		const addonIds = collectAddonProductIds(updates.addonGroups);
		await ensureAddonProductsExist(addonIds);
	}

	const patch = {};
	if (typeof updates.name === "string") patch.name = updates.name.trim();
	if (typeof updates.category === "string") patch.category = updates.category;

	if (Array.isArray(updates.sizes)) {
		patch.sizes = updates.sizes.map((s) => ({
			name: s.name.trim(),
			price: s.price,
			isAvailable: typeof s.isAvailable === "boolean" ? s.isAvailable : true,
		}));
	}

	if (typeof updates.preparationTimeMinutes === "number") {
		patch.preparationTimeMinutes = updates.preparationTimeMinutes;
	}

	if (typeof updates.isAvailable === "boolean")
		patch.isAvailable = updates.isAvailable;

	if (Array.isArray(updates.images)) patch.images = cleanImages(updates.images);

	if (Array.isArray(updates.addonGroups)) {
		patch.addonGroups = updates.addonGroups.map((g) => ({
			name: g.name.trim(),
			isActive: typeof g.isActive === "boolean" ? g.isActive : true,
			sortOrder: Number.isInteger(g.sortOrder) ? g.sortOrder : 0,
			items: (g.items || []).map((it) => ({
				product: it.product,
				isActive: typeof it.isActive === "boolean" ? it.isActive : true,
				sortOrder: Number.isInteger(it.sortOrder) ? it.sortOrder : 0,
			})),
		}));
	}

	const updated = await Product.findByIdAndUpdate(productId, patch, {
		new: true,
	})
		.populate("category", "name image")
		.populate("addonGroups.items.product", "name images sizes isAvailable");

	if (!updated) {
		const err = new Error("PRODUCT_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	return updated;
}

export async function deleteProductService(productId) {
	await dbConnect();
	assertObjectId(productId);

	// safety: prevent deleting a product that is used as an add-on in other products
	const usedAsAddon = await Product.exists({
		"addonGroups.items.product": productId,
	});
	if (usedAsAddon) {
		const err = new Error("PRODUCT_USED_AS_ADDON");
		err.status = 409;
		throw err;
	}

	const deleted = await Product.findByIdAndDelete(productId);
	if (!deleted) {
		const err = new Error("PRODUCT_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	return deleted;
}
