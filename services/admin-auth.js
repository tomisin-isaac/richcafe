import dbConnect from "../utils/mongodb";
import Admin from "../models/Admin";
import bcrypt from "bcryptjs";
import { signAdminSession, verifyAdminSession } from "../utils/jwt";
import { publicAdmin } from "../req-validators/admin-auth";

export async function loginAdminService({ email, password }) {
	await dbConnect();

	const normalizedEmail = email.toLowerCase().trim();

	const admin = await Admin.findOne({
		email: normalizedEmail,
		isActive: true,
	}).select("+password");
	if (!admin) {
		const err = new Error("INVALID_CREDENTIALS");
		err.status = 401;
		throw err;
	}

	const ok = await bcrypt.compare(password, admin.password);
	if (!ok) {
		const err = new Error("INVALID_CREDENTIALS");
		err.status = 401;
		throw err;
	}

	admin.lastLoginAt = new Date();
	await admin.save();

	const token = signAdminSession({ adminId: admin._id });
	return { admin: publicAdmin(admin), token };
}

export async function getAdminFromRequestCookie(token) {
	if (!token) return null;

	let payload;
	try {
		payload = verifyAdminSession(token);
	} catch {
		return null;
	}

	if (payload?.typ !== "admin" || !payload?.sub) return null;

	await dbConnect();
	const admin = await Admin.findById(payload.sub);
	if (!admin || !admin.isActive) return null;

	return publicAdmin(admin);
}

export async function requireAdmin(req) {
	const token = req.cookies.get("admin_session")?.value;
	const admin = await getAdminFromRequestCookie(token);

	if (!admin) {
		const err = new Error("UNAUTHORIZED");
		err.status = 401;
		throw err;
	}

	return admin;
}
