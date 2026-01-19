import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../services/admin-auth";
import {
	createLocationSchema,
	yupErrorToDetails,
} from "../../../../req-validators/location";
import {
	createLocationService,
	listLocationsService,
} from "../../../../services/location";

export const runtime = "nodejs";

export async function POST(req) {
	try {
		await requireAdmin(req);

		const body = await req.json();
		const data = await createLocationSchema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		const location = await createLocationService(data);
		return NextResponse.json({ ok: true, location }, { status: 201 });
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
