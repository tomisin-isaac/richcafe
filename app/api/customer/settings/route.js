// app/api/settings/route.js
import { NextResponse } from "next/server";
import {
	getOrCreateSettingsService,
	updateSettingsService,
} from "../../../../services/settings";
import { requireUser } from "../../../../services/auth";

export async function GET(req) {
	await requireUser(req);
	const settings = await getOrCreateSettingsService();
	return NextResponse.json(settings);
}
