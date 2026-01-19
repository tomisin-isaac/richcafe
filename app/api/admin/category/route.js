import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../services/admin-auth";
import {
	createCategorySchema,
	yupErrorToDetails,
} from "../../../../req-validators/category";
import {
	createCategoryService,
	listCategoriesService,
} from "../../../../services/category";

export const runtime = "nodejs";

export async function POST(req) {
	try {
		await requireAdmin(req);

		const body = await req.json();
		const data = await createCategorySchema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		const category = await createCategoryService(data);
		return NextResponse.json({ ok: true, category }, { status: 201 });
	} catch (e) {
		if (e?.name === "ValidationError") {
			return NextResponse.json(
				{ ok: false, error: "VALIDATION_ERROR", details: yupErrorToDetails(e) },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}

export async function GET(req) {
	try {
		await requireAdmin(req);

		const categories = await listCategoriesService();
		return NextResponse.json({ ok: true, categories }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
