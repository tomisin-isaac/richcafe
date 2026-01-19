import { NextResponse } from "next/server";
import { requireUser } from "../../../../services/auth";
import { getOrCreateCartService } from "../../../../services/cart";

export const runtime = "nodejs";

export async function GET(req) {
	try {
		const user = await requireUser(req);
		const cart = await getOrCreateCartService(user.id);
		return NextResponse.json({ ok: true, cart }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
