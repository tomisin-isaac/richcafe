import { NextResponse } from "next/server";
import { listCustomersService } from "../../../../services/customer";

export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);

		const page = searchParams.get("page");
		const limit = searchParams.get("limit");
		const search = searchParams.get("search");

		const data = await listCustomersService({
			page,
			limit,
			search,
		});

		return NextResponse.json(data);
	} catch (error) {
		return NextResponse.json(
			{ error: error.message || "FAILED_TO_FETCH_CUSTOMERS" },
			{ status: error.status || 500 }
		);
	}
}
