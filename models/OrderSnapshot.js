// models/OrderSnapshot.js
import mongoose from "mongoose";

const OrderSnapshotItemSchema = new mongoose.Schema(
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

const OrderSnapshotSchema = new mongoose.Schema(
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

		items: { type: [OrderSnapshotItemSchema], required: true },

		pricing: {
			subtotal: { type: Number, required: true, min: 0 },
			deliveryFee: { type: Number, required: true, min: 0 },
			vat: { type: Number, required: true, min: 0 },
			total: { type: Number, required: true, min: 0 },
		},

		reference: { type: String, default: null, trim: true },

		expiresAt: {
			type: Date,
			default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
			index: true,
		},
	},
	{ timestamps: true }
);

OrderSnapshotSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OrderSnapshotSchema.index({ reference: 1 }, { unique: true, sparse: true });
OrderSnapshotSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.OrderSnapshot ||
	mongoose.model("OrderSnapshot", OrderSnapshotSchema);
