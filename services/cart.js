import mongoose from "mongoose";
import dbConnect from "../utils/mongodb";
import Cart from "../models/Cart";
import Product from "../models/Product";

function assertObjectId(id, code = "INVALID_ID") {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		const err = new Error(code);
		err.status = 400;
		throw err;
	}
}

function recomputeCartTotals(cart) {
	let subtotal = 0;
	for (const item of cart.items) {
		item.lineTotal = item.unitPrice * item.quantity;
		subtotal += item.lineTotal;
	}
	cart.pricing.subtotal = subtotal;
	cart.pricing.total = subtotal;
}

async function findProductAndSize(productId, sizeId) {
	const product = await Product.findById(productId);
	if (!product || !product.isAvailable) {
		const err = new Error("PRODUCT_NOT_AVAILABLE");
		err.status = 409;
		throw err;
	}

	const size = product.sizes.id(sizeId);
	if (!size || !size.isAvailable) {
		const err = new Error("SIZE_NOT_AVAILABLE");
		err.status = 409;
		throw err;
	}

	return { product, size };
}

/**
 * GET or CREATE cart for user (safe upsert)
 */
export async function getOrCreateCartService(userId) {
	await dbConnect();
	assertObjectId(userId, "INVALID_USER_ID");

	// Upsert avoids race conditions with unique(user)
	const cart = await Cart.findOneAndUpdate(
		{ user: userId },
		{
			$setOnInsert: {
				user: userId,
				items: [],
				pricing: { subtotal: 0, total: 0 },
			},
		},
		{ new: true, upsert: true }
	);

	return cart;
}

/**
 * Add item to cart:
 * - if same product+size exists => increment quantity
 * - else push new item
 */
export async function addToCartService({
	userId,
	productId,
	sizeId,
	quantity,
}) {
	await dbConnect();

	assertObjectId(userId, "INVALID_USER_ID");
	assertObjectId(productId, "INVALID_PRODUCT_ID");
	assertObjectId(sizeId, "INVALID_SIZE_ID");

	const cart = await getOrCreateCartService(userId);
	const { product, size } = await findProductAndSize(productId, sizeId);

	const existing = cart.items.find(
		(it) =>
			String(it.product) === String(productId) &&
			String(it.sizeId) === String(sizeId)
	);

	if (existing) {
		const newQty = existing.quantity + quantity;
		if (newQty > 50) {
			const err = new Error("CART_ITEM_MAX_QTY");
			err.status = 400;
			throw err;
		}
		existing.quantity = newQty;
		// unitPrice stays snapshot, but you can refresh it here if you want:
		// existing.unitPrice = size.price;
	} else {
		const img =
			Array.isArray(product.images) && product.images.length > 0
				? product.images[0]
				: "";

		cart.items.push({
			product: product._id,
			productName: product.name,
			productImage: img,
			sizeId: size._id,
			sizeName: size.name,
			unitPrice: size.price,
			quantity,
			lineTotal: size.price * quantity,
		});
	}

	recomputeCartTotals(cart);
	await cart.save();

	return cart;
}

/**
 * Update quantity for a cart item by itemId
 */
export async function updateCartItemQtyService({ userId, itemId, quantity }) {
	await dbConnect();

	assertObjectId(userId, "INVALID_USER_ID");
	assertObjectId(itemId, "INVALID_CART_ITEM_ID");

	const cart = await getOrCreateCartService(userId);

	const item = cart.items.id(itemId);
	if (!item) {
		const err = new Error("CART_ITEM_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	// ✅ if quantity is 0 (or less), remove the item
	if (quantity <= 0) {
		item.deleteOne();
	} else {
		item.quantity = quantity;
	}

	recomputeCartTotals(cart);
	await cart.save();

	return cart;
}

/**
 * Remove a cart item
 */
export async function removeCartItemService({ userId, itemId }) {
	await dbConnect();

	assertObjectId(userId, "INVALID_USER_ID");
	assertObjectId(itemId, "INVALID_CART_ITEM_ID");

	const cart = await getOrCreateCartService(userId);

	const item = cart.items.id(itemId);
	if (!item) {
		const err = new Error("CART_ITEM_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	item.deleteOne();

	recomputeCartTotals(cart);
	await cart.save();

	return cart;
}

/**
 * Clear cart
 */
export async function clearCartService(userId) {
	await dbConnect();
	assertObjectId(userId, "INVALID_USER_ID");

	const cart = await getOrCreateCartService(userId);

	cart.items = [];
	cart.pricing.subtotal = 0;
	cart.pricing.total = 0;

	await cart.save();
	return cart;
}
