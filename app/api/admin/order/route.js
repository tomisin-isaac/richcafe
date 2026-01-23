import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../services/admin-auth";
import { listOrdersService } from "../../../../services/order";

export const runtime = "nodejs";

export async function GET(req) {
	try {
		await requireAdmin(req);

		const { searchParams } = new URL(req.url);
		const status = searchParams.get("status") || undefined;
		const locationId = searchParams.get("locationId") || undefined;
		const from = searchParams.get("from") || undefined;
		const to = searchParams.get("to") || undefined;
		const orderId = searchParams.get("orderId") || undefined;

		const result = await listOrdersService({
			status,
			locationId,
			orderId,
			from,
			to,
		});
		return NextResponse.json({ ok: true, ...result }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
