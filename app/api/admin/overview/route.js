import {
	getOverviewService,
	getSalesChartService,
	getOrdersBreakdownService,
} from "../../../../services/admin-overview";
import { requireAdmin } from "../../../../services/admin-auth";
import { NextResponse } from "next/server";

export async function GET(req) {
	try {
		await requireAdmin(req);

		const { searchParams } = new URL(req.url);
		const sales = searchParams.get("sales") || "weekly";
		const orders = searchParams.get("orders") || "this_month";

		const [salesData, ordersData, overview] = await Promise.all([
			getSalesChartService({ timeframe: sales }),
			getOrdersBreakdownService({ timeframe: orders }),
			getOverviewService(),
		]);

		return NextResponse.json({ overview, salesData, ordersData });
	} catch (err) {
		// console.log(err);
		return NextResponse.json(
			{ error: err.message },
			{ status: err.status || 500 }
		);
	}
}
