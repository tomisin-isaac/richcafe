import { NextResponse } from "next/server";
import {
	adminLoginSchema,
	yupErrorToDetails,
} from "../../../../../req-validators/admin-auth";
import { loginAdminService } from "../../../../../services/admin-auth";

export const runtime = "nodejs";

const COOKIE_NAME = "admin_session";
const cookieOptions = {
	httpOnly: true,
	sameSite: "lax",
	secure: process.env.NODE_ENV === "production",
	path: "/",
	maxAge: 60 * 60 * 24 * 30, // 30 days
};

export async function POST(req) {
	try {
		const body = await req.json();
		const data = await adminLoginSchema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		const { admin, token } = await loginAdminService(data);

		const res = NextResponse.json({ ok: true, admin }, { status: 200 });
		res.cookies.set(COOKIE_NAME, token, cookieOptions);
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
