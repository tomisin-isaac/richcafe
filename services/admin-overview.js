import dbConnect from "../utils/mongodb";
import User from "../models/User";
import Order from "../models/Order";
import Product from "../models/Product";

export async function getOverviewService() {
	await dbConnect();

	// today range
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);

	const endOfToday = new Date();
	endOfToday.setHours(23, 59, 59, 999);

	const [totalProducts, totalCustomers, deliveredToday, incomeAgg] =
		await Promise.all([
			Product.countDocuments({}),
			User.countDocuments({}),
			Order.countDocuments({
				status: "delivered",
				createdAt: { $gte: startOfToday, $lte: endOfToday },
			}),
			Order.aggregate([
				{
					$match: {
						status: "delivered",
						createdAt: { $gte: startOfToday, $lte: endOfToday },
					},
				},
				{
					$group: {
						_id: null,
						total: { $sum: "$pricing.total" },
					},
				},
			]),
		]);

	return {
		totalProducts,
		totalCustomers,
		deliveredToday,
		totalIncomeToday: incomeAgg[0]?.total || 0,
	};
}

function startOfWeek(date = new Date()) {
	const d = new Date(date);
	const day = d.getDay(); // 0 = Sun
	const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Mon start
	d.setDate(diff);
	d.setHours(0, 0, 0, 0);
	return d;
}

function endOfWeek(date = new Date()) {
	const d = startOfWeek(date);
	d.setDate(d.getDate() + 6);
	d.setHours(23, 59, 59, 999);
	return d;
}

export async function getSalesChartService({ timeframe }) {
	await dbConnect();

	if (timeframe === "weekly") {
		const start = startOfWeek();
		const end = endOfWeek();

		const data = await Order.aggregate([
			{
				$match: {
					status: "delivered",
					createdAt: { $gte: start, $lte: end },
				},
			},
			{
				$group: {
					_id: { $dayOfWeek: "$createdAt" }, // 1=Sun ... 7=Sat
					total: { $sum: "$pricing.total" },
				},
			},
		]);

		const map = { 1: 6, 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5 }; // Mon→Sun index
		const actualData = Array(7).fill(0);

		data.forEach((d) => {
			actualData[map[d._id]] = d.total;
		});

		return {
			labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			actualData,
			maxData: Math.max(...actualData),
			labelFormat: "Daily Sales",
		};
	}

	// ---- Monthly ----
	const yearStart = new Date(new Date().getFullYear(), 0, 1);
	const yearEnd = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999);

	const data = await Order.aggregate([
		{
			$match: {
				status: "delivered",
				createdAt: { $gte: yearStart, $lte: yearEnd },
			},
		},
		{
			$group: {
				_id: { $month: "$createdAt" }, // 1–12
				total: { $sum: "$pricing.total" },
			},
		},
	]);

	const actualData = Array(12).fill(0);
	data.forEach((d) => {
		actualData[d._id - 1] = d.total;
	});

	return {
		labels: [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		],
		actualData,
		maxData: Math.max(...actualData),
		labelFormat: "Monthly Sales",
	};
}

function getRange(timeframe) {
	const now = new Date();

	if (timeframe === "today") {
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		return { start, end: now, label: "Today" };
	}

	if (timeframe === "week") {
		return { start: startOfWeek(), end: endOfWeek(), label: "This Week" };
	}

	if (timeframe === "last_week") {
		const end = startOfWeek();
		const start = new Date(end);
		start.setDate(start.getDate() - 7);
		return { start, end, label: "Last Week" };
	}

	if (timeframe === "last_month") {
		const y = now.getFullYear();
		const m = now.getMonth() - 1;
		return {
			start: new Date(y, m, 1),
			end: new Date(y, m + 1, 0, 23, 59, 59),
			label: "Last Month",
		};
	}

	// default: this month
	return {
		start: new Date(now.getFullYear(), now.getMonth(), 1),
		end: now,
		label: "This Month",
	};
}

export async function getOrdersBreakdownService({ timeframe }) {
	await dbConnect();

	const { start, end, label } = getRange(timeframe);

	const data = await Order.aggregate([
		{
			$match: {
				status: "delivered",
				createdAt: { $gte: start, $lte: end },
			},
		},
		{ $unwind: "$items" },
		{
			$group: {
				_id: { $toLower: { $trim: { input: "$items.productName" } } },
				count: { $sum: "$items.quantity" },
			},
		},
		{ $sort: { count: -1 } },
		{ $limit: 5 },
	]);

	const total = data.reduce((sum, d) => sum + d.count, 0);

	const COLORS = [
		"#1f8f4a", // green
		"#f3a6c8", // light pink
		"#2c3e8f", // dark blue
		"#f5c542", // yellow
		"#9b59b6", // purple
	];

	return {
		total,
		breakdown: data.map((d) => d.count),
		labels: data.map((d) => d._id),
		labelText: label,
	};
}
