import { NextResponse } from "next/server";
import { resendOtpService } from "../../../../services/auth";

export async function POST(req) {
	try {
		const body = await req.json();
		const { email } = body;

		if (!email) {
			return NextResponse.json({ error: "EMAIL_REQUIRED" }, { status: 400 });
		}

		const result = await resendOtpService({ email });

		return NextResponse.json(result, { status: 200 });
	} catch (err) {
		const status = err.status || 500;
		return NextResponse.json(
			{ error: err.message || "RESEND_OTP_FAILED" },
			{ status }
		);
	}
}
