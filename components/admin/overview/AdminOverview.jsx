"use client";
import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Chart from "chart.js/auto";
import StackedOrderImages from "../orders/StackedOrderImages";
import { AnimatePresence, motion } from "framer-motion";
import OrderDetails from "../orders/OrderDetails";

export default function AdminOverview() {
	const salesCanvasRef = useRef(null);
	const salesChart = useRef(null);

	const orderCanvasRef = useRef(null);
	const orderChart = useRef(null);
	const [salesTF, setSalesTF] = useState("weekly");
	const [orderTF, setOrderTF] = useState("this_month");

	const [viewOrder, setViewOrder] = useState(null);

	const { data, isFetching, refetch } = useQuery({
		queryKey: ["overview", salesTF, orderTF],
		queryFn: async () => {
			const request = await fetch(
				`/api/admin/overview?sales=${salesTF}&orders=${orderTF}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response;
		},
		gcTime: 0,
	});

	const { data: orders, isFetching: ordersLoading } = useQuery({
		queryKey: ["orders"],
		queryFn: async () => {
			const request = await fetch(`/api/admin/order`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response;
		},
		gcTime: 0,
	});

	useEffect(() => {
		if (data) {
			const style = getComputedStyle(document.body);
			const greenAccent = style.getPropertyValue("--green-accent").trim();
			const chartBarLight = style.getPropertyValue("--chart-bar-light").trim(); // Light grey
			const textLight = style.getPropertyValue("--text-light").trim();
			const borderColor = style.getPropertyValue("--border-color").trim();

			const donutSegmentLightPink = style
				.getPropertyValue("--donut-segment-light-pink")
				.trim(); // Burger
			const donutSegmentDarkBlue = style
				.getPropertyValue("--donut-segment-dark-blue")
				.trim(); // Milkshake
			const cardBackground = style
				.getPropertyValue("--card-background-light")
				.trim(); // Border color for donut

			salesChart.current = new Chart(salesCanvasRef.current, {
				type: "bar",
				data: {
					labels: data.salesData.labels,
					datasets: [
						{
							label: data.salesData.labelFormat,
							data: data.salesData.actualData,
							backgroundColor: greenAccent, // Green for actual sales
							borderColor: "transparent",
							borderWidth: 1,
							borderRadius: 5,
							barPercentage: 0.7,
							categoryPercentage: 0.8,
							stack: "salesStack", // Group bars for stacking
						},
						{
							label: "Remaining Capacity", // This dataset fills the rest of the bar
							data: data.salesData.actualData.map(
								(val) => data.salesData.maxData - val
							), // Calculate remaining
							backgroundColor: chartBarLight, // Light grey
							borderColor: "transparent",
							borderWidth: 1,
							borderRadius: 5,
							barPercentage: 0.7,
							categoryPercentage: 0.8,
							stack: "salesStack", // Group bars for stacking
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: false,
						},
						tooltip: {
							mode: "index", // Show tooltip for all datasets at a point
							intersect: false, // Tooltip shows if cursor is anywhere on the x-axis
							callbacks: {
								label: function (context) {
									if (context.datasetIndex === 0) {
										// Only show label for the actual sales data
										let label = context.dataset.label || "";
										if (label) {
											label += ": ";
										}
										if (context.parsed.y !== null) {
											label += "₦" + context.parsed.y.toLocaleString();
										}
										return label;
									}
									return null; // Hide tooltip for the 'remaining' dataset
								},
							},
						},
					},
					scales: {
						y: {
							beginAtZero: true,
							max: data.salesData.maxData, // Set max based on the dummy data's max
							stacked: true, // Crucial for stacking bars
							ticks: {
								callback: function (value) {
									if (value >= 1000000) {
										return "₦" + value / 1000000 + "M";
									} else if (value >= 1000) {
										return "₦" + value / 1000 + "k";
									}
									return "₦" + value;
								},
								color: textLight,
							},
							grid: {
								color: borderColor,
								drawBorder: false,
							},
						},
						x: {
							stacked: true, // Crucial for stacking bars
							ticks: {
								color: textLight,
							},
							grid: {
								display: false,
								drawBorder: false,
							},
						},
					},
				},
			});

			orderChart.current = new Chart(orderCanvasRef.current, {
				type: "doughnut",
				data: {
					labels: data.ordersData.labels,
					datasets: [
						{
							data: data.ordersData.breakdown,
							backgroundColor: [
								greenAccent, // Rice
								donutSegmentLightPink, // Burger
								donutSegmentDarkBlue, // Milkshake
							],
							borderColor: cardBackground, // Border matches card background for seamless look
							borderWidth: 2,
							hoverOffset: 10,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					cutout: "80%", // Donut thickness
					plugins: {
						legend: {
							display: false,
						},
						tooltip: {
							callbacks: {
								label: function (context) {
									let label = context.label || "";
									if (label) {
										label += ": ";
									}
									if (context.parsed !== null) {
										label += context.parsed + " orders";
									}
									return label;
								},
							},
						},
					},
					// No explicit animation hook needed here for color changes,
					// as Chart.js handles it when the chart is re-instantiated.
				},
			});
		}

		return () => {
			if (orderChart.current && salesChart.current) {
				orderChart.current?.destroy();
				salesChart.current?.destroy();
			}
		};
	}, [data]);

	function formatDate(date) {
		const d = new Date(date);

		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "2-digit",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true,
		})
			.format(d)
			.replace(",", "");
	}

	return (
		<>
			<AnimatePresence>
				{viewOrder && (
					<motion.div
						className="w-max h-max"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<OrderDetails
							close={() => {
								setViewOrder(null);
							}}
							item={viewOrder}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			<section className="dashboard-section dashboard-overview-content">
				<div className="top-stat-cards-grid">
					<div className="dashboard-stat-card">
						<div className="stat-icon sales-icon">
							<i className="fas fa-book"></i>
						</div>
						<div className="stat-details">
							<p className="stat-label">Menu</p>
							<p className="stat-value" id="menuItemCount">
								{data?.overview?.totalProducts}
							</p>
						</div>
					</div>

					<div className="dashboard-stat-card">
						<div className="stat-icon orders-icon">
							<i className="fas fa-utensils"></i>
						</div>
						<div className="stat-details">
							<p className="stat-label">Today's Orders</p>
							<p className="stat-value">{data?.overview.deliveredToday}</p>
						</div>
					</div>

					<div className="dashboard-stat-card">
						<div className="stat-icon products-icon">
							<i className="fas fa-money-bill-wave"></i>
						</div>
						<div className="stat-details">
							<p className="stat-label">Today's Income</p>
							<p className="stat-value">₦{data?.overview.totalIncomeToday}</p>
						</div>
					</div>

					<div className="dashboard-stat-card">
						<div className="stat-icon customers-icon">
							<i className="fas fa-users"></i>
						</div>
						<div className="stat-details">
							<p className="stat-label">Customers</p>
							<p className="stat-value" id="totalCustomersCount">
								{data?.overview.totalCustomers}
							</p>
						</div>
					</div>
				</div>

				<div className="overview-grid">
					<div className="sales-figures-card">
						<div className="card-header">
							<h3 className="card-title">Sales Figures</h3>
							<div className="dropdown">
								<select
									value={salesTF}
									onChange={(e) => {
										setSalesTF(e.target.value);
									}}
									className="timeframe-select">
									<option value="weekly">Weekly</option>
									<option value="monthly">Monthly</option>
								</select>
							</div>
						</div>
						<div className="sales-chart-placeholder">
							<canvas ref={salesCanvasRef} id="salesBarChart"></canvas>
						</div>
					</div>

					<div className="orders-received-card">
						<div className="card-header">
							<h3 className="card-title">Top 5 Most Sold Products</h3>
							<div className="dropdown">
								<select
									value={orderTF}
									onChange={(e) => {
										setOrderTF(e.target.value);
									}}
									id="orderTimeframeSelect">
									<option value="today">Today</option>
									<option value="week">This Week</option>
									<option value="last_week">Last Week</option>
									<option value="this_month">This Month</option>
									<option value="last_month">Last Month</option>
								</select>
							</div>
						</div>
						<div className="order-status-content">
							<div className="donut-chart-container">
								<div className="donut-chart-outer">
									<canvas ref={orderCanvasRef} id="ordersDonutChart"></canvas>
									<div className="donut-chart-inner">
										<p className="chart-label" id="donutTimeframeLabel">
											{data?.ordersData.labelText}
										</p>
										<p className="chart-value" id="donutOrderCount">
											{data?.ordersData.total}
										</p>
										<p className="chart-sub-label" id="donutSubLabel">
											Orders
										</p>
									</div>
								</div>
							</div>
							<div className="order-breakdown">
								{data &&
									data.ordersData.breakdown.map((d, i) => {
										return (
											<div key={i} className="breakdown-item">
												<span className="color-dot rice-orders"></span>
												{data.ordersData.labels[i]} (
												<span id="riceOrders">{d} Orders</span>)
											</div>
										);
									})}

								{/* <div className="breakdown-item">
									<span className="color-dot burger-orders"></span> Burger (
									<span id="burgerOrders">70</span>
									Orders)
								</div>
								<div className="breakdown-item">
									<span className="color-dot milkshake-orders"></span> Milkshake
									(<span id="milkshakeOrders">50</span> Orders)
								</div> */}
							</div>
						</div>
					</div>
				</div>

				<div className="dashboard-section order-list-section">
					<div className="section-title">Recent Orders</div>

					<div className="table-responsive">
						<table className="orders-table">
							<thead>
								<tr>
									<th className="!text-xl">No</th>
									<th className="!text-xl">ID</th>
									<th className="!text-xl">Items</th>
									<th className="!text-xl">Location</th>
									<th className="!text-xl">Hostel Name</th>
									<th className="!text-xl">Date</th>
									<th className="!text-xl">Amount</th>
									<th className="!text-xl">Order Status</th>
									<th className="!text-xl">Action</th>
								</tr>
							</thead>
							<tbody>
								{ordersLoading &&
									Array(5)
										.fill("")
										.map((d, i) => (
											<tr key={i}>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
												</td>
											</tr>
										))}

								{!ordersLoading &&
									orders &&
									orders.orders.map((order, index) => (
										<tr key={index} className="text-2xl">
											<td>{index + 1}</td>
											<td>{order.orderId}</td>
											<td>
												<StackedOrderImages items={order.items} />
											</td>
											<td>{order.location}</td>
											<td>{order.hostelName}</td>
											<td>{formatDate(order.createdAt)}</td>
											<td>₦{order.pricing.total.toLocaleString()}</td>
											<td>
												<span
													className={`px-6 w-max py-3 rounded-full flex items-center justify-center ${
														[
															"pending",
															"processing",
															"out_for_delivery",
														].includes(order.status)
															? "bg-orange-200 text-orange-700"
															: ""
													} ${
														order.status === "cancelled"
															? "bg-red-200 text-red-700"
															: ""
													} ${
														order.status === "delivered"
															? "bg-green-200 text-green-700"
															: ""
													}`}>
													{order.status}
												</span>
											</td>
											<td>
												<div
													onClick={() => {
														setViewOrder(order);
													}}
													className="flex items-center cursor-pointer">
													<i
														className="fas fa-eye view-order-icon"
														title="View Order Details"></i>
													<span>View</span>
												</div>
											</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				</div>
			</section>
		</>
	);
}
