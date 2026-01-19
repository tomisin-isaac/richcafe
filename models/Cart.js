import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},

		// snapshots for fast/stable rendering
		productName: { type: String, required: true, trim: true },
		productImage: { type: String, default: "", trim: true },

		sizeId: { type: mongoose.Schema.Types.ObjectId, required: true },
		sizeName: { type: String, required: true, trim: true },

		unitPrice: { type: Number, required: true, min: 0 }, // smallest unit
		quantity: { type: Number, required: true, min: 1, max: 50 },

		lineTotal: { type: Number, required: true, min: 0 }, // unitPrice * quantity
	},
	{ _id: true }
);

const CartSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true, // one cart per user
			index: true,
		},

		items: { type: [CartItemSchema], default: [] },

		pricing: {
			subtotal: { type: Number, default: 0, min: 0 },
			total: { type: Number, default: 0, min: 0 },
		},
	},
	{ timestamps: true }
);

CartSchema.index({ updatedAt: -1 });

export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);
