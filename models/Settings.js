import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
	{
		logo: {
			type: String,
			default: "",
			trim: true,
		},

		isOpen: {
			type: Boolean,
			default: true,
			index: true,
		},
	},
	{ timestamps: true }
);

// ensure only ONE settings document exists
SettingsSchema.index({}, { unique: true });

export default mongoose.models.Settings ||
	mongoose.model("Settings", SettingsSchema);
