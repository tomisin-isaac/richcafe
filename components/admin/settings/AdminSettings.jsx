"use client";
import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import AddLocationModal from "./AddLocationModal";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import DeleteLocation from "./DeleteLocation";
import Spinner from "../../shared/Spinner";
export default function AdminSettings() {
	const [addingLocation, setAddingLocation] = useState(false);
	const [editLocation, setEditLocation] = useState(false);
	const [deleteLocation, setDeleteLocation] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const { data, isFetching, refetch } = useQuery({
		queryKey: ["settings"],
		queryFn: async () => {
			const request = await fetch(`/api/admin/settings`, {
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

	const updateHandler = async (data) => {
		try {
			setErrorMessage("");
			setSubmitting(true);
			const request = await fetch(`/api/admin/settings`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			setSuccessMessage("Settings updated successfuly.");
			setSubmitting(false);

			refetch();
		} catch (error) {
			setErrorMessage(error.message);
			setSubmitting(false);
			throw error;
		}
	};

	return (
		<>
			<AnimatePresence>
				{addingLocation && (
					<motion.div
						className="w-max h-max"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<AddLocationModal close={() => setAddingLocation(false)} />
					</motion.div>
				)}
				{editLocation && (
					<motion.div
						className="w-max h-max"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<AddLocationModal
							editLocation={editLocation}
							close={() => setEditLocation(null)}
						/>
					</motion.div>
				)}
				{deleteLocation && (
					<motion.div
						className="w-max h-max"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<DeleteLocation
							id={deleteLocation._id}
							close={() => setDeleteLocation(null)}
						/>
					</motion.div>
				)}
			</AnimatePresence>

			<section className="settings-content">
				<div className="card settings-card">
					<div className="section-header">
						<h2 className="section-title">Operational Hours</h2>
					</div>
					<div className="operational-hours-status">
						<div
							className={`status-indicator ${
								data?.isOpen ? "!bg-[#28a745]" : "!bg-[#dc3545]"
							}`}
							id="operationalStatusIndicator"></div>
						<span id="operationalStatusText">
							{data?.isOpen ? "Open" : "Closed"} For Business
						</span>
						<button
							onClick={() => {
								if (data) {
									updateHandler({ ...data, isOpen: !data.isOpen });
								}
							}}
							className="toggle-button"
							id="toggleOperationalHours">
							{submitting ? <Spinner /> : "Toggle Status"}
						</button>
					</div>
				</div>

				<div className="card settings-card">
					<div className="section-header">
						<h2 className="section-title">Location and Price Tags</h2>
						<button
							onClick={() => {
								setAddingLocation(true);
							}}
							className="add-button"
							id="addLocationBtn">
							<i className="fas fa-plus"></i> Add Location
						</button>
					</div>
					<div className="table-responsive">
						<table className="data-table locations-table">
							<thead>
								<tr className="text-2xl">
									<th>No</th>
									<th>Location</th>
									<th>Day Price</th>
									<th>Night Price</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody id="locationsTableBody">
								{!locationsLoading && locations && locations.length === 0 && (
									<tr>
										<td colspan="5" className="text-center p-5">
											No delivery locations added yet.
										</td>
									</tr>
								)}
								{locationsLoading &&
									Array(5)
										.fill("")
										.map((d, i) => (
											<tr key={i}>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
												</td>
												<td className="py-5">
													<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
												</td>
											</tr>
										))}
								{!locationsLoading &&
									locations &&
									locations.map((loc, idx) => (
										<tr key={idx} className="text-2xl">
											<td>{idx + 1}</td>
											<td>{loc.name}</td>
											<td>₦{loc.dayDeliveryFee.toLocaleString()}</td>
											<td>₦{loc.nightDeliveryFee.toLocaleString()}</td>
											<td>
												<div className="flex items-center gap-5">
													<i
														onClick={() => {
															setEditLocation(loc);
														}}
														className="fas fa-edit edit-item-icon text-2xl"></i>
													<i
														onClick={() => {
															setDeleteLocation(loc);
														}}
														className="fas fa-trash-alt delete-item-icon text-2xl"></i>
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
