"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRootStore } from "../shared/providers/RootProvider";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import StackedOrderImages from "../admin/orders/StackedOrderImages";
import OrderDetailsUser from "./OrderDetailsUser";

export default function OrderPage() {
	const [filter, setFilter] = useState({
		from: "",
		to: "",
		locationId: "",
		status: "pending",
		orderId: "",
		page: 1,
	});

	const [currentOrder, setCurrentOrder] = useState(null);

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

	const { data: orders, isFetching: ordersLoading } = useQuery({
		queryKey: ["orders", filter],
		queryFn: async () => {
			const request = await fetch(
				`/api/customer/order${buildQueryString(filter)}`,
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
		<div className="product-container !w-full">
			<header className="product-header">
				{currentOrder && (
					<div
						onClick={() => {
							setCurrentOrder(null);
						}}
						className="product-back-btn cursor-pointer"
						id="productBackBtn"
						aria-label="Go back">
						<i className="fas fa-arrow-left"></i>
					</div>
				)}
				<h1 className="product-title !m-0 !p-0" id="productCategoryTitle">
					{!currentOrder ? "My Orders" : currentOrder.orderId}
				</h1>
			</header>
			{currentOrder && <OrderDetailsUser item={currentOrder} />}
			{!currentOrder && (
				<>
					<div className="bg-white p-3 rounded-xl flex items-center gap-3 w-full overflow-auto mt-5">
						<button
							onClick={() => setFilter({ ...filter, status: "pending" })}
							className={`shrink-0 w-max flex items-center justify-center px-6 py-3 rounded-full text-xl ${
								filter.status === "pending"
									? "bg-green-800 text-white"
									: "bg-[#eaeaea]"
							}`}>
							Pending
						</button>

						<button
							onClick={() => setFilter({ ...filter, status: "processing" })}
							className={`shrink-0 w-max flex items-center justify-center px-6 py-3 rounded-full text-xl ${
								filter.status === "processing"
									? "bg-green-800 text-white"
									: "bg-[#eaeaea]"
							}`}>
							Processing
						</button>

						<button
							onClick={() =>
								setFilter({ ...filter, status: "out_for_delivery" })
							}
							className={`shrink-0 w-max flex items-center justify-center px-6 py-3 rounded-full text-xl ${
								filter.status === "out_for_delivery"
									? "bg-green-800 text-white"
									: "bg-[#eaeaea]"
							}`}>
							Out for Delivery
						</button>

						<button
							onClick={() => setFilter({ ...filter, status: "delivered" })}
							className={`shrink-0 w-max flex items-center justify-center px-6 py-3 rounded-full text-xl ${
								filter.status === "delivered"
									? "bg-green-800 text-white"
									: "bg-[#eaeaea]"
							}`}>
							Completed
						</button>

						<button
							onClick={() => setFilter({ ...filter, status: "cancelled" })}
							className={`shrink-0 w-max flex items-center justify-center px-6 py-3 rounded-full text-xl ${
								filter.status === "cancelled"
									? "bg-green-800 text-white"
									: "bg-[#eaeaea]"
							}`}>
							Cancelled
						</button>
					</div>

					<div className="w-full flex flex-col gap-5 mt-5">
						{orders?.orders.length === 0 && (
							<div className="flex flex-col items-center justify-center h-[70vh] bg-white">
								<Image
									src={"/nodata.svg"}
									unoptimized
									width={300}
									height={300}
								/>
								<span className="text-2xl font-semibold">No order found!</span>
							</div>
						)}
						{ordersLoading &&
							Array(5)
								.fill("")
								.map((d, i) => (
									<div
										key={i}
										className="h-[150px] bg-[#d3d3d3] animate-pulse rounded-lg"></div>
								))}
						{!ordersLoading &&
							orders &&
							orders.orders.map((order, idx) => (
								<div
									onClick={() => {
										setCurrentOrder(order);
									}}
									key={idx}
									className="bg-white p-4 rounded-xl cursor-pointer">
									<div className="flex items-center justify-between pb-5 border-b border-b-[#eaeaea]">
										<div className="flex items-center gap-2">
											<div className="w-[35px] h-[35px] rounded-xl bg-orange-100 flex items-center justify-center">
												{["pending"].includes(order.status) && (
													<i className="fas fa-box text-2xl"></i>
												)}
												{["processing"].includes(order.status) && (
													<i className="fas fa-clock text-2xl"></i>
												)}
												{["out_for_delivery"].includes(order.status) && (
													<i className="fas fa-truck text-2xl"></i>
												)}
												{["delivered"].includes(order.status) && (
													<i className="fas fa-check-circle text-2xl"></i>
												)}
												{["cancelled"].includes(order.status) && (
													<i className="fa-solid fa-circle-xmark text-2xl"></i>
												)}
											</div>
											<div className="flex flex-col">
												<span className="font-bold text-2xl">ORDSHJ</span>
												<span className="text-xl text-[#787878]">
													Created on {formatDate(order.createdAt)}
												</span>
											</div>
										</div>
										<i className="fa-solid fa-chevron-right"></i>
									</div>
									<div className="flex gap-6 flex-wrap pt-5">
										<div className="flex flex-col gap-2">
											<span className="text-xl text-[#787878]">Items</span>
											<StackedOrderImages items={order.items} />
										</div>
										<div className="flex flex-col gap-2">
											<span className="text-xl text-[#787878]">Total</span>
											<span className="font-bold text-2xl">
												₦{order.pricing.total.toLocaleString()}
											</span>
										</div>
										<div className="flex flex-col gap-2">
											<span className="text-xl text-[#787878]">Status</span>
											<span
												className={`px-3 w-max py-1 rounded-full flex items-center justify-center ${
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
										</div>
									</div>
								</div>
							))}
					</div>
				</>
			)}
		</div>
	);
}
