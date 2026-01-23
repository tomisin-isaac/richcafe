import { NextResponse } from "next/server";
import { listUserOrdersService } from "../../../../services/order";
import { requireUser } from "../../../../services/auth";

export const runtime = "nodejs";

export async function GET(req) {
	try {
		const user = await requireUser(req);

		const { searchParams } = new URL(req.url);
		const status = searchParams.get("status") || undefined;

		const result = await listUserOrdersService({ status, userId: user.id });
		return NextResponse.json({ ok: true, ...result }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
