import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../services/admin-auth";
import {
	createProductSchema,
	yupErrorToDetails,
} from "../../../../req-validators/product";
import {
	createProductService,
	listProductsService,
} from "../../../../services/product";

export const runtime = "nodejs";

export async function POST(req) {
	try {
		await requireAdmin(req);

		const body = await req.json();
		const data = await createProductSchema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		const product = await createProductService(data);
		return NextResponse.json({ ok: true, product }, { status: 201 });
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
