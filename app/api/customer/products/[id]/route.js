import { NextResponse } from "next/server";
import { getProductByIdService } from "../../../../../services/product";
import { requireUser } from "../../../../../services/auth";

export const runtime = "nodejs";

export async function GET(req, { params }) {
	try {
		await requireUser(req);

		const product = await getProductByIdService((await params).id);
		return NextResponse.json({ ok: true, product }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
