import dbConnect from "../utils/mongodb";
import User from "../models/User";

export async function listCustomersService({
	page = 1,
	limit = 20,
	search = "",
} = {}) {
	await dbConnect();

	const filter = {};

	if (search && typeof search === "string") {
		const q = search.trim();

		if (q) {
			filter.$or = [
				{ name: { $regex: q, $options: "i" } },
				{ email: { $regex: q, $options: "i" } },
				{ phone: { $regex: q, $options: "i" } },
			];
		}
	}

	const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
	const safePage = Math.max(1, Number(page) || 1);
	const skip = (safePage - 1) * safeLimit;

	const [totalCount, users] = await Promise.all([
		User.countDocuments(filter),
		User.find(filter)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(safeLimit)
			.select("name email phone createdAt"),
	]);

	const totalPages = Math.max(1, Math.ceil(totalCount / safeLimit));
	const prevPage = safePage > 1 ? safePage - 1 : null;
	const nextPage = safePage < totalPages ? safePage + 1 : null;

	return {
		users,
		totalCount,
		totalPages,
		page: safePage,
		prevPage,
		nextPage,
		limit: safeLimit,
	};
}

export async function updateProfilePictureService({ userId, profilePicture }) {
	await dbConnect();

	if (!profilePicture || typeof profilePicture !== "string") {
		const err = new Error("INVALID_PROFILE_PICTURE_URL");
		err.status = 400;
		throw err;
	}

	// Optional: basic safety check
	if (!profilePicture.startsWith("https://")) {
		const err = new Error("INVALID_PROFILE_PICTURE_URL");
		err.status = 400;
		throw err;
	}

	const user = await User.findByIdAndUpdate(
		userId,
		{ profilePicture },
		{ new: true }
	).select("name email phone profilePicture");

	if (!user) {
		const err = new Error("USER_NOT_FOUND");
		err.status = 404;
		throw err;
	}

	return user;
}
