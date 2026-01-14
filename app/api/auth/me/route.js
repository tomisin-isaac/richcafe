import { NextResponse } from "next/server";
import dbConnect from "../../../../utils/mongodb";
import User from "../../../../models/User";
import { publicUser } from "../../../../req-validators/auth";

export const runtime = "nodejs";

export async function GET(req) {
	try {
		const token = req.cookies.get("session")?.value;
		if (!token)
			return NextResponse.json(
				{ ok: false, error: "UNAUTHORIZED" },
				{ status: 401 }
			);

		const payload = verifySession(token);
		const userId = payload?.sub;
		if (!userId)
			return NextResponse.json(
				{ ok: false, error: "UNAUTHORIZED" },
				{ status: 401 }
			);

		await dbConnect();
		const user = await User.findById(userId);
		if (!user)
			return NextResponse.json(
				{ ok: false, error: "UNAUTHORIZED" },
				{ status: 401 }
			);

		return NextResponse.json(
			{ ok: true, user: publicUser(user) },
			{ status: 200 }
		);
	} catch {
		return NextResponse.json(
			{ ok: false, error: "UNAUTHORIZED" },
			{ status: 401 }
		);
	}
}
