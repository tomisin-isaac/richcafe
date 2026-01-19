import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../services/admin-auth";
import {
	updateLocationSchema,
	yupErrorToDetails,
} from "../../../../../req-validators/location";
import {
	getLocationByIdService,
	updateLocationService,
	deleteLocationService,
} from "../../../../../services/location";

export const runtime = "nodejs";

export async function GET(req, { params }) {
	try {
		await requireAdmin(req);
		const location = await getLocationByIdService((await params).id);
		return NextResponse.json({ ok: true, location }, { status: 200 });
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
		const data = await updateLocationSchema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		if (Object.keys(data).length === 0) {
			return NextResponse.json(
				{ ok: false, error: "NO_UPDATES" },
				{ status: 400 }
			);
		}

		const location = await updateLocationService((await params).id, data);
		return NextResponse.json({ ok: true, location }, { status: 200 });
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
		const location = await deleteLocationService((await params).id);
		return NextResponse.json({ ok: true, location }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
