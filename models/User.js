import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		name: String,
		email: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
			unique: true,
			index: true,
		},
		phone: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			index: true,
		},
		password: { type: String, required: true }, // store hash here
		isActive: {
			type: Boolean,
			default: false,
		},
		otp: {
			code: { type: String },
			expiresAt: { type: Date },
			lastSentAt: { type: Date },
		},
		profilePicture: String,
	},
	{ timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
