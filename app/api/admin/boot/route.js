import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "../../../../utils/mongodb";
import Admin from "../../../../models/Admin";
import {
	adminBootstrapSchema,
	yupErrorToDetails,
	publicAdmin,
} from "../../../../req-validators/admin-auth";

export const runtime = "nodejs";

export async function POST(req) {
	try {
		await dbConnect();

		const existingOwner = await Admin.findOne({ role: "owner" });
		if (existingOwner) {
			return NextResponse.json(
				{ ok: false, error: "OWNER_ALREADY_EXISTS" },
				{ status: 409 }
			);
		}

		const fallback = {
			name: process.env.OWNER_ADMIN_NAME || "Owner",
			email: process.env.OWNER_ADMIN_EMAIL,
			password: process.env.OWNER_ADMIN_PASSWORD,
			phone: "",
		};

		const merged = {
			...fallback,
		};

		const data = await adminBootstrapSchema.validate(merged, {
			abortEarly: false,
			stripUnknown: true,
		});

		const email = data.email.toLowerCase().trim();

		const exists = await Admin.findOne({ email });
		if (exists) {
			return NextResponse.json(
				{ ok: false, error: "EMAIL_ALREADY_EXISTS" },
				{ status: 409 }
			);
		}

		const passwordHash = await bcrypt.hash(data.password, 12);

		const admin = await Admin.create({
			name: data.name,
			email,
			phone: data.phone,
			password: passwordHash,
			role: "owner",
			isActive: true,
		});

		return NextResponse.json(
			{ ok: true, admin: publicAdmin(admin) },
			{ status: 201 }
		);
	} catch (e) {
		if (e?.name === "ValidationError") {
			return NextResponse.json(
				{ ok: false, error: "VALIDATION_ERROR", details: yupErrorToDetails(e) },
				{ status: 400 }
			);
		}
		return NextResponse.json(
			{ ok: false, error: e?.message || "SERVER_ERROR" },
			{ status: 500 }
		);
	}
}
