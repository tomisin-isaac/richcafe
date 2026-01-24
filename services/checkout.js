import dbConnect from "../utils/mongodb";
import Cart from "../models/Cart";
import Location from "../models/Location";
import OrderSnapshot from "../models/OrderSnapshot";
import Order from "../models/Order";
import ShortUniqueId from "short-unique-id";

function getHourInLagos(date = new Date()) {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: "Africa/Lagos",
		hour: "2-digit",
		hour12: false,
	}).formatToParts(date);

	const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";
	return Number(hourStr);
}

function isNightFeeHour(hour) {
	// night: 12:00am (0) to before 7:00am (7)
	return hour >= 0 && hour < 7;
}

function moneyInt(n) {
	const x = Number(n);
	return Number.isFinite(x) ? Math.round(x) : 0;
}

function toKobo(naira) {
	const x = Number(naira);
	if (!Number.isFinite(x)) return 0;
	return Math.round(x * 100);
}

function toNaira(kobo) {
	const x = Number(kobo);
	if (!Number.isFinite(x)) return 0;
	return Math.round(x / 100); // assumes you only accept whole naira
}

export function computeVat(subtotal) {
	// Optional: set VAT_RATE="0.075" (7.5%). Default 0 if not set.
	const rate = Number(process.env.VAT_RATE ?? 0.075);
	if (!Number.isFinite(rate) || rate <= 0) return 0;
	return moneyInt(subtotal * rate);
}

const uid = new ShortUniqueId({ dictionary: "alphanum_upper", length: 5 });

async function generateUniqueOrderId() {
	// 5 chars is small; avoid collisions by retrying a few times + unique index in db
	for (let i = 0; i < 8; i++) {
		const orderId = uid.randomUUID();
		const exists = await OrderSnapshot.exists({ orderId });
		if (!exists) return orderId;
	}
	const err = new Error("FAILED_TO_GENERATE_ORDER_ID");
	err.status = 500;
	throw err;
}

export async function checkoutService({
	user,
	locationId,
	hostelName,
	deliveryMethod,
	deliveryInstructions = "",
}) {
	await dbConnect();

	if (!["home", "pickup"].includes(deliveryMethod)) {
		const err = new Error("INVALID_DELIVERY_METHOD");
		err.status = 400;
		throw err;
	}

	const cart = await Cart.findOne({ user: user.id });
	if (!cart || cart.items.length === 0) {
		const err = new Error("CART_EMPTY");
		err.status = 400;
		throw err;
	}

	const location = await Location.findById(locationId);
	if (!location || !location.isActive) {
		const err = new Error("LOCATION_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	// delivery fee
	let deliveryFee = 0;

	if (deliveryMethod === "home") {
		const hour = getHourInLagos(new Date());
		deliveryFee = isNightFeeHour(hour)
			? moneyInt(location.nightDeliveryFee)
			: moneyInt(location.dayDeliveryFee);
	}

	// subtotal (defensive recompute)
	const subtotal = moneyInt(
		(cart.items || []).reduce(
			(sum, it) => sum + moneyInt(it.unitPrice) * moneyInt(it.quantity),
			0
		)
	);

	const vat = computeVat(subtotal);
	const total = moneyInt(subtotal + deliveryFee + vat);

	const orderId = await generateUniqueOrderId();

	// 🧾 Create snapshot FIRST
	const orderSnapshot = await OrderSnapshot.create({
		orderId,
		user: user.id,

		locationId: location._id,
		location: location.name,
		hostelName: hostelName.trim(),

		// ✅ NEW
		deliveryMethod,
		deliveryInstructions: deliveryInstructions.trim(),

		items: cart.items.map((it) => ({
			product: it.product,
			productName: it.productName,
			productImage: it.productImage,
			sizeId: it.sizeId,
			sizeName: it.sizeName,
			unitPrice: it.unitPrice,
			quantity: it.quantity,
			lineTotal: moneyInt(it.unitPrice) * moneyInt(it.quantity),
		})),

		pricing: {
			subtotal,
			deliveryFee,
			vat,
			total,
		},

		reference: null,
	});

	const params = {
		email: user.email,
		amount: toKobo(total),
		callback_url: process.env.orderSuccessURL,
		metadata: {
			cancel_action: process.env.orderCancelURL,
			cart_id: JSON.stringify({
				order_id: orderId,
				snapshot_id: String(orderSnapshot._id),
				user_id: String(user.id),
				type: "ORDER_PAYMENT",
			}),
		},
	};

	const request = await fetch(
		"https://api.paystack.co/transaction/initialize",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${process.env.PayStack_SECRET_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(params),
		}
	);

	if (!request.ok) {
		const text = await request.text();
		const err = new Error("PAYSTACK_INIT_FAILED");
		err.status = 502;
		err.details = text;
		throw err;
	}

	const response = await request.json();

	const paystackRef = response?.data?.reference ?? null;
	if (paystackRef) {
		orderSnapshot.reference = paystackRef;
		await orderSnapshot.save();
	}

	return {
		orderId,
		snapshotId: String(orderSnapshot._id),
		reference: paystackRef,
		paystack: response,
	};
}

function safeParseJson(val) {
	if (!val) return null;
	if (typeof val === "object") return val;
	if (typeof val !== "string") return null;

	try {
		return JSON.parse(val);
	} catch {
		return null;
	}
}

export async function verifyCheckoutService({ user, reference }) {
	await dbConnect();

	if (!reference || typeof reference !== "string") {
		const err = new Error("REFERENCE_REQUIRED");
		err.status = 400;
		throw err;
	}

	// ✅ Idempotency: if we already created the order for this reference, return it.
	const existingOrder = await Order.findOne({ reference });
	if (existingOrder) {
		return { order: existingOrder, paystack: null, alreadyProcessed: true };
	}

	// 1) Verify on Paystack
	const verifyResponse = await fetch(
		`https://api.paystack.co/transaction/verify/${encodeURIComponent(
			reference
		)}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${process.env.PayStack_SECRET_KEY}`,
			},
		}
	);

	if (!verifyResponse.ok) {
		const text = await verifyResponse.text();
		const err = new Error("PAYSTACK_VERIFY_FAILED");
		err.status = 502;
		err.details = text;
		throw err;
	}

	const verifyRes = await verifyResponse.json();
	const paystackData = verifyRes?.data;

	// Paystack API call success check
	if (!verifyRes?.data?.status || !paystackData) {
		const err = new Error("PAYSTACK_VERIFY_FAILED");
		err.status = 502;
		throw err;
	}

	if (paystackData.status !== "success") {
		const err = new Error("PAYMENT_NOT_SUCCESSFUL");
		err.status = 400;
		throw err;
	}

	// 2) Find snapshot by reference
	const snapshot = await OrderSnapshot.findOne({ reference });
	if (!snapshot) {
		const err = new Error("ORDER_SNAPSHOT_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	// 3) Validate amount matches snapshot total
	const paidAmountKobo = Number(paystackData.amount);
	const expectedAmountKobo = toKobo(snapshot.pricing.total);
	if (
		!Number.isFinite(paidAmountKobo) ||
		paidAmountKobo !== expectedAmountKobo
	) {
		const err = new Error("AMOUNT_MISMATCH");
		err.status = 400;
		throw err;
	}

	// 4) Validate metadata
	const metadata =
		safeParseJson(paystackData.metadata) ?? paystackData.metadata ?? {};
	const cartIdRaw = metadata?.cart_id;
	const cartId = safeParseJson(cartIdRaw);
	if (!cartId) {
		const err = new Error("INVALID_PAYMENT_METADATA");
		err.status = 400;
		throw err;
	}

	if (String(cartId.order_id) !== String(snapshot.orderId))
		throw new Error("ORDER_ID_MISMATCH");
	if (String(cartId.snapshot_id) !== String(snapshot._id))
		throw new Error("SNAPSHOT_ID_MISMATCH");
	if (String(cartId.user_id) !== String(user.id))
		throw new Error("USER_MISMATCH");

	// 5) Idempotent order creation using $setOnInsert + upsert
	const result = await Order.updateOne(
		{ orderId: snapshot.orderId },
		{
			$setOnInsert: {
				orderId: snapshot.orderId,
				user: snapshot.user,
				locationId: snapshot.locationId,
				location: snapshot.location,
				hostelName: snapshot.hostelName,
				items: snapshot.items,
				pricing: snapshot.pricing,
				deliveryMethod: snapshot.deliveryMethod,
				deliveryInstructions: snapshot.deliveryInstructions,
				reference,
				status: "pending",
			},
		},
		{ upsert: true }
	);

	// Fetch the order after upsert
	const order = await Order.findOne({ orderId: snapshot.orderId });
	const alreadyProcessed = result.matchedCount > 0;

	// 6) Clear cart (best effort)
	await Cart.findOneAndUpdate(
		{ user: user.id },
		{ $set: { items: [], pricing: { subtotal: 0, total: 0 } } }
	);

	// 7) Delete snapshot (optional; TTL exists anyway)
	await OrderSnapshot.deleteOne({ _id: snapshot._id });

	return { order, paystack: paystackData, alreadyProcessed };
}

export async function handlePaystackWebhookService({ event, data }) {
	await dbConnect();

	// Only care about successful charges
	if (event !== "charge.success") {
		return { ignored: true };
	}

	const reference = data?.reference;
	if (!reference) throw new Error("REFERENCE_MISSING");

	// 🔐 Re-verify with Paystack (never trust webhook blindly)
	const verifyRes = await fetch(
		`https://api.paystack.co/transaction/verify/${encodeURIComponent(
			reference
		)}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${process.env.PayStack_SECRET_KEY}`,
			},
		}
	);

	if (!verifyRes.ok) {
		const text = await verifyRes.text();
		const err = new Error("PAYSTACK_VERIFY_FAILED");
		err.details = text;
		throw err;
	}

	const verifyData = await verifyRes.json();
	const paystackData = verifyData?.data;

	if (!paystackData || paystackData.status !== "success") {
		throw new Error("PAYMENT_NOT_SUCCESSFUL");
	}

	// 1️⃣ Find snapshot
	const snapshot = await OrderSnapshot.findOne({ reference });
	if (!snapshot) throw new Error("ORDER_SNAPSHOT_NOT_FOUND");

	// 2️⃣ Amount validation
	const paidAmountKobo = Number(paystackData.amount);
	const expectedAmountKobo = toKobo(snapshot.pricing.total);
	if (paidAmountKobo !== expectedAmountKobo) throw new Error("AMOUNT_MISMATCH");

	// 3️⃣ Metadata validation
	const metadata =
		safeParseJson(paystackData.metadata) ?? paystackData.metadata ?? {};
	const cartIdRaw = metadata?.cart_id;
	const cartId = safeParseJson(cartIdRaw);
	if (!cartId) throw new Error("INVALID_METADATA");

	if (String(cartId.order_id) !== String(snapshot.orderId))
		throw new Error("ORDER_ID_MISMATCH");
	if (String(cartId.snapshot_id) !== String(snapshot._id))
		throw new Error("SNAPSHOT_ID_MISMATCH");

	// 4️⃣ Idempotent order creation with $setOnInsert
	const result = await Order.updateOne(
		{ orderId: snapshot.orderId },
		{
			$setOnInsert: {
				orderId: snapshot.orderId,
				user: snapshot.user,
				locationId: snapshot.locationId,
				location: snapshot.location,
				hostelName: snapshot.hostelName,
				items: snapshot.items,
				pricing: snapshot.pricing,
				deliveryMethod: snapshot.deliveryMethod,
				deliveryInstructions: snapshot.deliveryInstructions,
				reference,
				status: "pending",
			},
		},
		{ upsert: true }
	);

	const order = await Order.findOne({ orderId: snapshot.orderId });
	const alreadyProcessed = result.matchedCount > 0;

	// 5️⃣ Clear cart (best effort)
	await Cart.findOneAndUpdate(
		{ user: snapshot.user },
		{ $set: { items: [], pricing: { subtotal: 0, total: 0 } } }
	);

	// 6️⃣ Delete snapshot (optional; TTL exists anyway)
	await OrderSnapshot.deleteOne({ _id: snapshot._id });

	return { order, alreadyProcessed };
}
