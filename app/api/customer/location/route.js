import { NextResponse } from "next/server";
import { requireUser } from "../../../../services/auth";
import { listLocationsService } from "../../../../services/location";

export const runtime = "nodejs";

export async function GET(req) {
	try {
		await requireUser(req);

		const { searchParams } = new URL(req.url);
		const activeOnly = searchParams.get("activeOnly") === "true";

		const locations = await listLocationsService({ activeOnly });
		return NextResponse.json({ ok: true, locations }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
