// app/api/settings/route.js
import { NextResponse } from "next/server";
import {
	getOrCreateSettingsService,
	updateSettingsService,
} from "../../../../services/settings";
import { requireAdmin } from "../../../../services/admin-auth";

export async function GET() {
	const settings = await getOrCreateSettingsService();
	return NextResponse.json(settings);
}

export async function PATCH(req) {
	await requireAdmin(req);

	const body = await req.json();

	const settings = await updateSettingsService({
		logo: body.logo,
		isOpen: body.isOpen,
	});

	return NextResponse.json(settings);
}
