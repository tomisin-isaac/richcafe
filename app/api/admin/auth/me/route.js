import { NextResponse } from "next/server";
import { getAdminFromRequestCookie } from "../../../../../services/admin-auth";

export const runtime = "nodejs";

export async function GET(req) {
	const token = req.cookies.get("admin_session")?.value;
	const admin = await getAdminFromRequestCookie(token);

	if (!admin) {
		return NextResponse.json(
			{ ok: false, error: "UNAUTHORIZED" },
			{ status: 401 }
		);
	}

	return NextResponse.json({ ok: true, admin }, { status: 200 });
}
