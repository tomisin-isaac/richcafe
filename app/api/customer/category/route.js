import { listCategoriesService } from "../../../../services/category";
import { requireUser } from "../../../../services/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
	try {
		await requireUser(req);

		const categories = await listCategoriesService();
		return NextResponse.json({ ok: true, categories }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
