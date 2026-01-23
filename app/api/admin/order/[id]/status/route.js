import { NextResponse } from "next/server";
import * as yup from "yup";

import { requireAdmin } from "../../../../../../services/admin-auth";
import { updateOrderStatusService } from "../../../../../../services/order";

export const runtime = "nodejs";

const schema = yup
	.object({
		status: yup
			.string()
			.oneOf(["pending", "processing", "out_for_delivery", "delivered"])
			.required(),
	})
	.noUnknown(true);

function yupErrorToDetails(err) {
	if (!err?.inner?.length) return null;
	const details = {};
	for (const e of err.inner)
		if (e.path && !details[e.path]) details[e.path] = e.message;
	return details;
}

export async function PATCH(req, { params }) {
	try {
		await requireAdmin(req);

		const body = await req.json();
		const data = await schema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		const order = await updateOrderStatusService({
			orderId: (await params).id,
			status: data.status,
		});

		return NextResponse.json({ ok: true, order }, { status: 200 });
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
