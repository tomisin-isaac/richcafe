import { NextResponse } from "next/server";
import { requireUser } from "../../../../../services/auth";
import {
	addCartItemSchema,
	yupErrorToDetails,
} from "../../../../../req-validators/cart";
import { addToCartService } from "../../../../../services/cart";

export const runtime = "nodejs";

export async function POST(req) {
	try {
		const user = await requireUser(req);

		const body = await req.json();
		const data = await addCartItemSchema.validate(body, {
			abortEarly: false,
			stripUnknown: true,
		});

		const cart = await addToCartService({
			userId: user.id,
			productId: data.productId,
			sizeId: data.sizeId,
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
