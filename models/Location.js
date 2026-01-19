// models/Location.js
import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			index: true,
		},

		// ✅ delivery fees (smallest unit)
		dayDeliveryFee: { type: Number, required: true, min: 0, default: 0 },
		nightDeliveryFee: { type: Number, required: true, min: 0, default: 0 },

		isActive: { type: Boolean, default: true, index: true },
		sortOrder: { type: Number, default: 0, index: true },
	},
	{ timestamps: true }
);

export default mongoose.models.Location ||
	mongoose.model("Location", LocationSchema);
