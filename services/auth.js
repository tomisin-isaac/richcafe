import dbConnect from "../utils/mongodb";
import { hashPassword, verifyPassword } from "../utils/password";
import { signSession, verifySession } from "../utils/jwt";
import { publicUser } from "../req-validators/auth";
import User from "../models/User";

export async function signupService({ name, email, phone, password }) {
	await dbConnect();

	const normalizedEmail = email.toLowerCase().trim();
	const normalizedPhone = phone.trim();

	const existing = await User.findOne({
		$or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
	});

	if (existing) {
		const field = existing.email === normalizedEmail ? "email" : "phone";
		const err = new Error(`${field.toUpperCase()}_ALREADY_EXISTS`);
		err.status = 409;
		throw err;
	}

	const passwordHash = await hashPassword(password);

	const user = await User.create({
		name: (name || "").trim(),
		email: normalizedEmail,
		phone: normalizedPhone,
		password: passwordHash, // store hash here
	});

	const token = signSession({ userId: user._id });

	return { user: publicUser(user), token };
}

export async function loginService({ email, password }) {
	await dbConnect();

	const normalizedEmail = email.toLowerCase().trim();

	// If your schema uses `select: false` on password, this ensures we still get it:
	const user = await User.findOne({ email: normalizedEmail });

	if (!user) {
		const err = new Error("INVALID_CREDENTIALS");
		err.status = 401;
		throw err;
	}

	const ok = await verifyPassword(password, user.password);
	if (!ok) {
		const err = new Error("INVALID_CREDENTIALS");
		err.status = 401;
		throw err;
	}

	const token = signSession({ userId: user._id });

	return { user: publicUser(user), token };
}

export async function getUserFromRequestCookie(token) {
	if (!token) return null;

	let payload;
	try {
		payload = verifySession(token);
	} catch {
		return null;
	}

	if (!payload?.sub) return null;

	await dbConnect();
	const user = await User.findById(payload.sub);

	return publicUser(user);
}

export async function requireUser(req) {
	const token = req.cookies.get("session")?.value;
	const user = await getUserFromRequestCookie(token);

	if (!user) {
		const err = new Error("UNAUTHORIZED");
		err.status = 401;
		throw err;
	}

	return user;
}
