import { NextResponse } from "next/server";
import {
	loginSchema,
	yupErrorToDetails,
} from "../../../../req-validators/auth";
import { loginService } from "../../../../services/auth";

export const runtime = "nodejs";

export async function POST(req) {
	try {
		const body = await req.json();
		const data = await loginSchema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		const { user, token } = await loginService(data);

		const res = NextResponse.json({ ok: true, user }, { status: 200 });
		res.cookies.set("session", token, {
			httpOnly: true,
			sameSite: "lax",
			secure: process.env.NODE_ENV === "production",
			path: "/",
			maxAge: 60 * 60 * 24 * 30,
		});

		return res;
	} catch (e) {
		if (e?.name === "ValidationError") {
			return NextResponse.json(
				{ ok: false, error: "VALIDATION_ERROR", details: yupErrorToDetails(e) },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
