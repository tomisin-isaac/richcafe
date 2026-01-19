import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		image: { type: String, default: "", trim: true },
	},
	{ timestamps: true }
);

// Helpful index for search/sort
CategorySchema.index({ name: 1 });

export default mongoose.models.Category ||
	mongoose.model("Category", CategorySchema);
