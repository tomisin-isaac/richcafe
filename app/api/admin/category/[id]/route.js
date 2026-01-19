import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../services/admin-auth";
import {
	updateCategorySchema,
	yupErrorToDetails,
} from "../../../../../req-validators/category";
import {
	getCategoryByIdService,
	updateCategoryService,
	deleteCategoryService,
} from "../../../../../services/category";

export const runtime = "nodejs";

export async function GET(req, { params }) {
	try {
		await requireAdmin(req);

		const category = await getCategoryByIdService((await params).id);
		return NextResponse.json({ ok: true, category }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}

export async function PATCH(req, { params }) {
	try {
		await requireAdmin(req);

		const body = await req.json();
		const data = await updateCategorySchema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		// refuse empty patch
		if (!("name" in data) && !("image" in data)) {
			return NextResponse.json(
				{ ok: false, error: "NO_UPDATES" },
				{ status: 400 }
			);
		}

		const category = await updateCategoryService((await params).id, data);
		return NextResponse.json({ ok: true, category }, { status: 200 });
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

export async function DELETE(req, { params }) {
	try {
		await requireAdmin(req);

		const deleted = await deleteCategoryService((await params).id);
		return NextResponse.json({ ok: true, category: deleted }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
