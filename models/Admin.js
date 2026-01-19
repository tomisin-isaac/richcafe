import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
	{
		name: { type: String, default: "", trim: true },

		email: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
			unique: true,
			index: true,
		},

		phone: { type: String, default: "", trim: true },

		// store bcrypt hash (not plain password)
		password: { type: String, required: true, select: false },

		role: {
			type: String,
			enum: ["owner", "manager", "staff"],
			default: "owner",
			index: true,
		},

		isActive: { type: Boolean, default: true, index: true },

		lastLoginAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
