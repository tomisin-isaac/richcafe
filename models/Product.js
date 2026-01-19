import mongoose from "mongoose";

const SizeSchema = new mongoose.Schema(
	{
		// e.g. "Small", "Medium", "Large"
		name: { type: String, required: true, trim: true },

		// store as integer in smallest unit (kobo/cents)
		price: { type: Number, required: true, min: 0 },

		// optional: disable only this size
		isAvailable: { type: Boolean, default: true, index: true },
	},
	{ _id: true, timestamps: false } // keep _id so UI/order can reference sizeId
);

const AddonItemSchema = new mongoose.Schema(
	{
		// the add-on product (customer will pick its size)
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},

		// allow disabling this add-on for THIS parent product without disabling globally
		isActive: { type: Boolean, default: true },

		// ordering in UI
		sortOrder: { type: Number, default: 0 },
	},
	{ _id: false }
);

const AddonGroupSchema = new mongoose.Schema(
	{
		// e.g. "Add a drink", "Sides", "Extras"
		name: { type: String, required: true, trim: true },

		items: { type: [AddonItemSchema], default: [] },

		// ordering of groups
		sortOrder: { type: Number, default: 0 },

		isActive: { type: Boolean, default: true },
	},
	{ _id: false }
);

const ProductSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },

		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Category",
			required: true,
			index: true,
		},

		// user must pick one size when adding to cart
		sizes: {
			type: [SizeSchema],
			required: true,
			validate: {
				validator: (arr) => Array.isArray(arr) && arr.length > 0,
				message: "Product must have at least one size",
			},
		},

		preparationTimeMinutes: { type: Number, required: true, min: 1, max: 300 },

		// overall availability of product
		isAvailable: { type: Boolean, default: true, index: true },

		images: { type: [String], default: [] },

		// ✅ add-ons: the add-on products also have sizes; user selects size in UI
		addonGroups: { type: [AddonGroupSchema], default: [] },
	},
	{ timestamps: true }
);

// common menu query
ProductSchema.index({ category: 1, isAvailable: 1, createdAt: -1 });

export default mongoose.models.Product ||
	mongoose.model("Product", ProductSchema);
