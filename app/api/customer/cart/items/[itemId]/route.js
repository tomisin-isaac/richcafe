import { NextResponse } from "next/server";
import { requireUser } from "../../../../../../services/auth";
import {
	updateCartItemSchema,
	yupErrorToDetails,
} from "../../../../../../req-validators/cart";
import {
	updateCartItemQtyService,
	removeCartItemService,
} from "../../../../../../services/cart";

export const runtime = "nodejs";

export async function PATCH(req, { params }) {
	try {
		const user = await requireUser(req);

		const body = await req.json();
		const data = await updateCartItemSchema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		const cart = await updateCartItemQtyService({
			userId: user.id,
			itemId: (await params).itemId,
			quantity: data.quantity,
		});

		return NextResponse.json({ ok: true, cart }, { status: 200 });
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
		const user = await requireUser(req);

		const cart = await removeCartItemService({
			userId: user.id,
			itemId: (await params).itemId,
		});

		return NextResponse.json({ ok: true, cart }, { status: 200 });
	} catch (e) {
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: e?.status || 500 }
		);
	}
}
