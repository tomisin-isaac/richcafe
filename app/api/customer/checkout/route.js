export const runtime = "nodejs";

import { NextResponse } from "next/server";
import * as yup from "yup";
import { requireUser } from "../../../../services/auth";
import { checkoutService } from "../../../../services/checkout";

const schema = yup
	.object({
		locationId: yup.string().trim().required(),
		hostelName: yup.string().trim().required(),
	})
	.noUnknown(true);

function yupErrorToDetails(err) {
	if (!err?.inner?.length) return null;
	const details = {};
	for (const e of err.inner)
		if (e.path && !details[e.path]) details[e.path] = e.message;
	return details;
}

export async function POST(req) {
	try {
		const user = await requireUser(req);

		const body = await req.json();
		const data = await schema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		const result = await checkoutService({
			user,
			locationId: data.locationId,
			hostelName: data.hostelName,
		});

		return NextResponse.json({ ok: true, ...result }, { status: 200 });
	} catch (e) {
		console.log(e);
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
