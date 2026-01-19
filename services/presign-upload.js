import { getUploadURL } from "../utils/s3";

export async function presignUploadService({ key, contentType }) {
	if (!key || !contentType) {
		const err = new Error("INVALID_PAYLOAD");
		err.status = 400;
		throw err;
	}

	const url = await getUploadURL(key, contentType);
	return { url };
}
