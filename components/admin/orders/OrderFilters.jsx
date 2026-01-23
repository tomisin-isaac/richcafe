"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

export const ORDER_STATUS_LABELS = {
	pending: "Pending",
	processing: "Processing",
	out_for_delivery: "Out for delivery",
	delivered: "Delivered",
	cancelled: "Cancelled",
};

export const ORDER_STATUS_FLOW = [
	"pending",
	"processing",
	"out_for_delivery",
	"delivered",
	"cancelled",
];

export default function OrderFilters({ apply, close, currentFilter }) {
	const [filter, setFilter] = useState(currentFilter);

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

	return (
		<div id="filterOrdersModal" className="modal !flex">
			<div className="modal-content">
				<span onClick={close} className="close-button">
					&times;
				</span>
				<h2 className="!text-[20px]">Filters</h2>
				<div id="filterOrdersForm">
					<div className="form-group">
						<label htmlFor="startDate">Start Date:</label>
						<input
							className="h-[40px] w-full outline-none border border-[#eaeaea] rounded-xl px-3 text-xl font-medium"
							type="date"
							value={filter.from}
							onChange={(e) => {
								//console.log(e.target.value);
								setFilter({ ...filter, from: e.target.value });
							}}
							id="startDate"
							name="startDate"
						/>
					</div>
					<div className="form-group">
						<label htmlFor="endDate">End Date:</label>
						<input
							type="date"
							value={filter.to}
							className="h-[40px] w-full outline-none border border-[#eaeaea] rounded-xl px-3 text-xl font-medium"
							id="endDate"
							name="endDate"
							onChange={(e) => {
								//console.log(e.target.value);
								setFilter({ ...filter, to: e.target.value });
							}}
						/>
					</div>
					<div className="form-group">
						<label htmlFor="endDate">Status:</label>
						<select
							onChange={(e) => {
								//console.log(e.target.value);
								setFilter({ ...filter, status: e.target.value });
							}}
							value={filter.status}
							className="w-full outline-none border border-[#eaeaea] rounded-xl px-3 text-xl font-medium">
							<option value="">All</option>
							{ORDER_STATUS_FLOW.map((f, i) => (
								<option key={i} value={f}>
									{ORDER_STATUS_LABELS[f]}
								</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label htmlFor="endDate">Location:</label>
						<select
							onChange={(e) => {
								//console.log(e.target.value);
								setFilter({ ...filter, locationId: e.target.value });
							}}
							value={filter.locationId}
							className="w-full outline-none border border-[#eaeaea] rounded-xl px-3 text-xl font-medium">
							<option value="">All</option>
							{locations &&
								locations.map((loc, i) => (
									<option key={i} value={loc._id}>
										{loc.name}
									</option>
								))}
						</select>
					</div>
					<div className="flex items-center gap-3">
						<button
							onClick={() => {
								apply({
									from: "",
									to: "",
									locationId: "",
									status: "",
								});
							}}
							type="button"
							className="submit-button !bg-[#eaeaea] !text-[#787878]">
							Reset Filters
						</button>
						<button
							onClick={() => {
								apply(filter);
							}}
							type="button"
							className="submit-button">
							Apply Filter
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
