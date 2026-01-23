import mongoose from "mongoose";
import dbConnect from "../utils/mongodb";
import Order from "../models/Order";
import Location from "../models/Location";

function assertObjectId(id, code = "INVALID_ID") {
	if (!mongoose.Types.ObjectId.isValid(id)) {
		const err = new Error(code);
		err.status = 400;
		throw err;
	}
}

const ALLOWED_STATUSES = new Set([
	"pending",
	"processing",
	"out_for_delivery",
	"delivered",
]);

export async function listOrdersService({
	status,
	locationId,
	orderId,
	from,
	to,
	page = 1,
	limit = 20,
} = {}) {
	await dbConnect();

	const filter = {};

	if (status) {
		if (!ALLOWED_STATUSES.has(status)) {
			const err = new Error("INVALID_STATUS_FILTER");
			err.status = 400;
			throw err;
		}
		filter.status = status;
	}

	if (locationId) {
		assertObjectId(locationId, "INVALID_LOCATION_ID");
		filter.locationId = locationId;
	}

	// ✅ exact orderId match
	if (orderId) {
		filter.orderId = String(orderId).trim();
	}

	// ✅ date filtering on createdAt
	if (from || to) {
		filter.createdAt = {};

		if (from) {
			const fromDate = new Date(from);
			if (Number.isNaN(fromDate.getTime())) {
				const err = new Error("INVALID_FROM_DATE");
				err.status = 400;
				throw err;
			}
			filter.createdAt.$gte = fromDate;
		}

		if (to) {
			const toDate = new Date(to);
			if (Number.isNaN(toDate.getTime())) {
				const err = new Error("INVALID_TO_DATE");
				err.status = 400;
				throw err;
			}
			filter.createdAt.$lte = toDate;
		}

		// if both were invalid/empty somehow, clean up
		if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
	}

	const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
	const safePage = Math.max(1, Number(page) || 1);
	const skip = (safePage - 1) * safeLimit;

	const [totalCount, orders] = await Promise.all([
		Order.countDocuments(filter),
		Order.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(safeLimit)
			.populate("user", "name email phone")
			.populate("locationId", "name dayDeliveryFee nightDeliveryFee"),
	]);

	const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit));
	const prevPage = safePage > 1 ? safePage - 1 : null;
	const nextPage = safePage < totalPages ? safePage + 1 : null;

	return {
		orders,
		totalCount,
		totalPages,
		page: safePage,
		prevPage,
		nextPage,
		limit: safeLimit,
	};
}

export async function listUserOrdersService({
	userId,
	status,
	page = 1,
	limit = 20,
} = {}) {
	await dbConnect();

	assertObjectId(userId, "INVALID_USER_ID");

	const filter = { user: userId };

	if (status) {
		if (!ALLOWED_STATUSES.has(status)) {
			const err = new Error("INVALID_STATUS_FILTER");
			err.status = 400;
			throw err;
		}
		filter.status = status;
	}

	const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
	const safePage = Math.max(1, Number(page) || 1);
	const skip = (safePage - 1) * safeLimit;

	const [totalCount, orders] = await Promise.all([
		Order.countDocuments(filter),
		Order.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(safeLimit)
			.populate("locationId", "name dayDeliveryFee nightDeliveryFee"),
	]);

	const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit));
	const prevPage = safePage > 1 ? safePage - 1 : null;
	const nextPage = safePage < totalPages ? safePage + 1 : null;

	return {
		orders,
		totalCount,
		totalPages,
		page: safePage,
		prevPage,
		nextPage,
		limit: safeLimit,
	};
}

export async function updateOrderStatusService({ orderId, status }) {
	await dbConnect();

	assertObjectId(orderId, "INVALID_ORDER_ID");

	if (!ALLOWED_STATUSES.has(status)) {
		const err = new Error("INVALID_STATUS");
		err.status = 400;
		throw err;
	}

	const order = await Order.findByIdAndUpdate(
		orderId,
		{ status },
		{ new: true }
	)
		.populate("user", "name email phone")
		.populate("locationId", "name dayDeliveryFee nightDeliveryFee");

	if (!order) {
		const err = new Error("ORDER_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	return order;
}
