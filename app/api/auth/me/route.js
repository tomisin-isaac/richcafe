import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/mongodb";
import User from "../../../../models/User";
import { publicUser } from "../../../../req-validators/auth";
import { verifySession } from "../../../../utils/jwt";
import { requireUser } from "../../../../services/auth";

export const runtime = "nodejs";

export async function GET(req) {
	try {
		const user = await requireUser(req);

		return NextResponse.json({ ok: true, user: user }, { status: 200 });
	} catch {
		return NextResponse.json(
			{ ok: false, error: "UNAUTHORIZED" },
			{ status: 401 }
		);
	}
}
