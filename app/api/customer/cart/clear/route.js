import { NextResponse } from "next/server";
import { requireUser } from "../../../../../services/auth";
import { clearCartService } from "../../../../../services/cart";

export const runtime = "nodejs";

export async function POST(req) {
	try {
		const user = await requireUser(req);
		const cart = await clearCartService(user.id);
		return NextResponse.json({ ok: true, cart }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
