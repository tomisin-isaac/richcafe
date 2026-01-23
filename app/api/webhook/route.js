import { handlePaystackWebhookService } from "../../../services/checkout";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const POST = async (req) => {
	try {
		// 1️⃣ Get raw body
		const rawBody = await req.text();

		// 2️⃣ Verify signature
		const signature = req.headers.get("x-paystack-signature");
		if (!signature) {
			return NextResponse.json({ error: "No signature" }, { status: 401 });
		}

		const hash = crypto
			.createHmac("sha512", process.env.PayStack_SECRET_KEY)
			.update(rawBody)
			.digest("hex");

		if (hash !== signature) {
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		// 3️⃣ Parse payload
		const payload = JSON.parse(rawBody);

		// 4️⃣ Call service
		await handlePaystackWebhookService(payload);

		// 5️⃣ ACK Paystack
		return NextResponse.json({ status: "success" });
	} catch (err) {
		console.error("Paystack Webhook Error:", err);
		// ✅ Always return 200 to avoid retries storm
		return NextResponse.json({ status: "error" }, { status: 500 });
	}
};
