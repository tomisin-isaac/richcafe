import { NextResponse } from "next/server";
import { verifyOtpService } from "../../../../services/auth";

export async function POST(req) {
	try {
		const body = await req.json();
		const { email, code } = body;

		if (!email || !code) {
			return NextResponse.json(
				{ error: "EMAIL_AND_CODE_REQUIRED" },
				{ status: 400 }
			);
		}

		const { user, token } = await verifyOtpService({
			email,
			code,
		});

		const response = NextResponse.json({ user, token }, { status: 200 });

		response.cookies.set("session", token, {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 60 * 60 * 24 * 30,
		});

		return response;
	} catch (err) {
		const status = err.status || 500;
		return NextResponse.json(
			{ error: err.message || "VERIFY_OTP_FAILED" },
			{ status }
		);
	}
}
