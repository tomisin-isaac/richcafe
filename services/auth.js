import dbConnect from "../utils/mongodb";
import { hashPassword, verifyPassword } from "../utils/password";
import { signSession, verifySession } from "../utils/jwt";
import { publicUser } from "../req-validators/auth";
import User from "../models/User";
import ShortUniqueId from "short-unique-id";
import { sendOtpEmail } from "../utils/mailer";

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

	const { randomUUID } = new ShortUniqueId({
		dictionary: "number",
		length: 6,
	});

	const otpCode = randomUUID();

	const user = await User.create({
		name: (name || "").trim(),
		email: normalizedEmail,
		phone: normalizedPhone,
		password: passwordHash,
		isActive: false,
		otp: {
			code: otpCode,
			expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
		},
	});

	await sendOtpEmail({
		to: user.email,
		code: otpCode,
	});

	return {
		message: "OTP_SENT",
		email: user.email,
	};
}

export async function verifyOtpService({ email, code }) {
	await dbConnect();

	const user = await User.findOne({
		email: email.toLowerCase().trim(),
	});

	if (!user) {
		const err = new Error("USER_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	if (user.isActive) {
		const err = new Error("ACCOUNT_ALREADY_VERIFIED");
		err.status = 400;
		throw err;
	}

	console.log(user);

	if (
		!user.otp?.code ||
		user.otp.code !== code ||
		!user.otp.expiresAt ||
		user.otp.expiresAt < new Date()
	) {
		const err = new Error("INVALID_OR_EXPIRED_OTP");
		err.status = 400;
		throw err;
	}

	user.isActive = true;
	user.otp = undefined;

	await user.save();

	const token = signSession({ userId: user._id });

	return {
		user: publicUser(user),
		token,
	};
}

export async function resendOtpService({ email }) {
	await dbConnect();

	const user = await User.findOne({
		email: email.toLowerCase().trim(),
	});

	if (!user) {
		const err = new Error("USER_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	if (user.isActive) {
		const err = new Error("ACCOUNT_ALREADY_VERIFIED");
		err.status = 400;
		throw err;
	}

	const now = Date.now();

	if (user.otp?.lastSentAt && now - user.otp.lastSentAt.getTime() < 60 * 1000) {
		const err = new Error("OTP_RESEND_TOO_SOON");
		err.status = 429;
		throw err;
	}

	const { randomUUID } = new ShortUniqueId({
		dictionary: "number",
		length: 6,
	});

	const code = randomUUID();

	user.otp = {
		code,
		expiresAt: new Date(now + 10 * 60 * 1000),
		lastSentAt: new Date(now),
	};

	await user.save();

	await sendOtpEmail({
		to: user.email,
		code,
	});

	return { message: "OTP_RESENT" };
}

export async function loginService({ email, password }) {
	await dbConnect();

	const normalizedEmail = email.toLowerCase().trim();

	const user = await User.findOne({ email: normalizedEmail });

	if (!user) {
		const err = new Error("INVALID_CREDENTIALS");
		err.status = 401;
		throw err;
	}

	if (!user.isActive) {
		const err = new Error("ACCOUNT_NOT_VERIFIED");
		err.status = 403;

		const { randomUUID } = new ShortUniqueId({
			dictionary: "number",
			length: 6,
		});

		const otpCode = randomUUID();

		const now = Date.now();

		user.otp = {
			code: otpCode,
			expiresAt: new Date(now + 10 * 60 * 1000),
			lastSentAt: new Date(now),
		};

		await user.save();

		await sendOtpEmail({
			to: user.email,
			code: otpCode,
		});

		//console.log("sent email");

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

	// console.log(user);

	if (!user) {
		const err = new Error("UNAUTHORIZED");
		err.status = 401;
		throw err;
	}

	return user;
}
