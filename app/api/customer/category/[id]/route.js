import { NextResponse } from "next/server";

import { requireUser } from "../../../../../services/auth";

import { getCategoryByIdService } from "../../../../../services/category";

export const runtime = "nodejs";

export async function GET(req, { params }) {
	try {
		await requireUser(req);

		const category = await getCategoryByIdService((await params).id);
		return NextResponse.json({ ok: true, category }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
