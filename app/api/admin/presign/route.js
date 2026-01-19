import { NextResponse } from "next/server";
import * as yup from "yup";
import { requireAdmin } from "../../../../services/admin-auth";
import { presignUploadService } from "../../../../services/presign-upload";

export const runtime = "nodejs";

const presignSchema = yup
	.object({
		key: yup.string().trim().required(),
		contentType: yup.string().trim().required(),
	})
	.noUnknown(true);

function yupErrorToDetails(err) {
	if (!err?.inner?.length) return null;
	const details = {};
	for (const e of err.inner) {
		if (e.path && !details[e.path]) details[e.path] = e.message;
	}
	return details;
}

export async function POST(req) {
	try {
		await requireAdmin(req);

		const body = await req.json();
		const data = await presignSchema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		const result = await presignUploadService(data);
		return NextResponse.json({ ok: true, ...result }, { status: 200 });
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
