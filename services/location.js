import dbConnect from "../utils/mongodb";
import Location from "../models/Location";

export async function createLocationService(payload) {
	await dbConnect();

	const name = payload.name.trim();

	const exists = await Location.findOne({ name });
	if (exists) {
		const err = new Error("LOCATION_NAME_ALREADY_EXISTS");
		err.status = 409;
		throw err;
	}

	const location = await Location.create({
		name,
		dayDeliveryFee: payload.dayDeliveryFee,
		nightDeliveryFee: payload.nightDeliveryFee,
		isActive: payload.isActive ?? true,
		sortOrder: payload.sortOrder ?? 0,
	});

	return location;
}

export async function listLocationsService({ activeOnly } = {}) {
	await dbConnect();
	const filter = activeOnly ? { isActive: true } : {};
	return Location.find(filter).sort({ sortOrder: 1, name: 1 });
}

export async function getLocationByIdService(id) {
	await dbConnect();
	const loc = await Location.findById(id);
	if (!loc) {
		const err = new Error("LOCATION_NOT_FOUND");
		err.status = 404;
		throw err;
	}
	return loc;
}

export async function updateLocationService(id, updates) {
	await dbConnect();

	const patch = {};
	if (typeof updates.name === "string") patch.name = updates.name.trim();
	if (typeof updates.dayDeliveryFee === "number")
		patch.dayDeliveryFee = updates.dayDeliveryFee;
	if (typeof updates.nightDeliveryFee === "number")
		patch.nightDeliveryFee = updates.nightDeliveryFee;
	if (typeof updates.isActive === "boolean") patch.isActive = updates.isActive;
	if (typeof updates.sortOrder === "number")
		patch.sortOrder = updates.sortOrder;

	if (patch.name) {
		const dup = await Location.findOne({ name: patch.name, _id: { $ne: id } });
		if (dup) {
			const err = new Error("LOCATION_NAME_ALREADY_EXISTS");
			err.status = 409;
			throw err;
		}
	}

	const loc = await Location.findByIdAndUpdate(id, patch, { new: true });
	if (!loc) {
		const err = new Error("LOCATION_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	return loc;
}

export async function deleteLocationService(id) {
	await dbConnect();

	const loc = await Location.findByIdAndDelete(id);
	if (!loc) {
		const err = new Error("LOCATION_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	return loc;
}
