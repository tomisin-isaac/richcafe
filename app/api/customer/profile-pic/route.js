import { NextResponse } from "next/server";
import { updateProfilePictureService } from "../../../../services/customer";
import { requireUser } from "../../../../services/auth";

export async function PATCH(req) {
	try {
		const user = await requireUser(req);
		const body = await req.json();

		const updatedUser = await updateProfilePictureService({
			userId: user.id,
			profilePicture: body.profilePicture,
		});

		return NextResponse.json({ user: updatedUser });
	} catch (err) {
		return NextResponse.json(
			{ error: err.message },
			{ status: err.status || 500 }
		);
	}
}
