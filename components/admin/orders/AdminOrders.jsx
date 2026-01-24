"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import StackedOrderImages from "./StackedOrderImages";
import { AnimatePresence, motion } from "framer-motion";
import OrderDetails from "./OrderDetails";
import OrderFilters from "./OrderFilters";
import Pagination from "../../shared/Pagination";

export default function AdminOrders() {
	const [viewOrder, setViewOrder] = useState(null);
	const [showFilter, setShowFilter] = useState(null);
	const [filter, setFilter] = useState({
		from: "",
		to: "",
		locationId: "",
		status: "",
		orderId: "",
		page: 1,
	});

	function buildQueryString(filters = {}) {
		const params = new URLSearchParams();

		Object.entries(filters).forEach(([key, value]) => {
			// skip null / undefined
			if (value === null || value === undefined) return;

			// handle strings
			if (typeof value === "string") {
				const v = value.trim();
				if (v !== "") params.append(key, v);
				return;
			}

			// handle numbers (allow 0)
			if (typeof value === "number" && Number.isFinite(value)) {
				params.append(key, String(value));
				return;
			}
		});

		const query = params.toString();
		return query ? `?${query}` : "";
	}

	const { data: locations, isFetching: locationsLoading } = useQuery({
		queryKey: ["locations"],
		queryFn: async () => {
			const request = await fetch(`/api/admin/location`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response.locations;
		},
		gcTime: 0,
	});

	const { data: orders, isFetching: ordersLoading } = useQuery({
		queryKey: ["orders", filter],
		queryFn: async () => {
			const request = await fetch(
				`/api/admin/order${buildQueryString(filter)}`,
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
		enabled: locations !== undefined,
	});

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
	//console.log(orders, locations);

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
				{showFilter && (
					<motion.div
						className="w-max h-max"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<OrderFilters
							apply={(val) => {
								setFilter(val);
								setShowFilter(false);
							}}
							close={() => {
								setShowFilter(false);
							}}
							currentFilter={filter}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			<section className="orders-management-content">
				<div className="section-header">
					<h2 className="section-title">Orders</h2>
					<div className="filter-controls">
						<div className="border border-[#eaeaea] !h-[40px] !p-2 rounded-lg">
							<i className="fas fa-search"></i>
							<input
								className="!h-full !text-2xl outline-none grow max-w-[90%] !p-0 !px-2"
								type="text"
								value={filter.orderId}
								placeholder="Search orders..."
								id="ordersSearchInput"
								onChange={(e) => {
									setFilter({ ...filter, orderId: e.target.value });
								}}
							/>
						</div>
						<button
							onClick={() => {
								setShowFilter(true);
							}}
							className="filter-button !h-[40px] "
							id="filterOrdersBtn">
							<i className="fas fa-filter"></i> Filter
						</button>
					</div>
				</div>

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
				{orders && (
					<Pagination
						totalPages={orders.totalPages}
						currentPage={filter.page}
						setCurrentPage={(val) => setFilter({ ...filter, page: val })}
					/>
				)}
			</section>
		</>
	);
}
