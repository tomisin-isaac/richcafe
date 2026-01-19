// models/Order.js
import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},

		// snapshots
		productName: { type: String, required: true, trim: true },
		productImage: { type: String, default: "", trim: true },

		sizeId: { type: mongoose.Schema.Types.ObjectId, required: true },
		sizeName: { type: String, required: true, trim: true },

		unitPrice: { type: Number, required: true, min: 0 },
		quantity: { type: Number, required: true, min: 1, max: 50 },
		lineTotal: { type: Number, required: true, min: 0 },
	},
	{ _id: false }
);

const OrderSchema = new mongoose.Schema(
	{
		orderId: { type: String, required: true, unique: true, index: true },

		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},

		locationId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Location",
			required: true,
			index: true,
		},
		location: { type: String, required: true, trim: true }, // snapshot
		hostelName: { type: String, required: true, trim: true },

		items: { type: [OrderItemSchema], required: true },

		pricing: {
			subtotal: { type: Number, required: true, min: 0 }, // items subtotal
			deliveryFee: { type: Number, required: true, min: 0 }, // snapshot from Location
			vat: { type: Number, required: true, min: 0 }, // snapshot
			total: { type: Number, required: true, min: 0 }, // subtotal + deliveryFee + vat
		},

		reference: { type: String, default: null, trim: true },

		status: {
			type: String,
			enum: ["pending", "processing", "out_for_delivery", "delivered"],
			default: "pending",
			index: true,
		},
	},
	{ timestamps: true }
);

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ reference: 1 }, { unique: true, sparse: true });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
