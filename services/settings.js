import Settings from "../models/Settings";
import dbConnect from "../utils/mongodb";
import { requireAdmin } from "./admin-auth";

export async function getOrCreateSettingsService() {
	await dbConnect();

	let settings = await Settings.findOne();

	if (!settings) {
		settings = await Settings.create({});
	}

	return settings;
}

export async function updateSettingsService({ logo, isOpen }) {
	await dbConnect();

	const update = {};

	if (typeof logo === "string") {
		update.logo = logo;
	}

	if (typeof isOpen === "boolean") {
		update.isOpen = isOpen;
	}

	const settings = await Settings.findOneAndUpdate(
		{},
		{ $set: update },
		{ new: true, upsert: true }
	);

	return settings;
}
