import { NextResponse } from "next/server";
import { requireUser } from "../../../../services/auth";

import { listProductsService } from "../../../../services/product";

export const runtime = "nodejs";

export async function GET(req) {
	try {
		await requireUser(req);

		const { searchParams } = new URL(req.url);
		const category = searchParams.get("category") || undefined; // categoryId
		const available = searchParams.get("available") || undefined; // "true" | "false"
		const q = searchParams.get("q") || undefined; // name search

		const products = await listProductsService({ category, available, q });
		return NextResponse.json({ ok: true, products }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
