"use client";
import React from "react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function ConfirmDelete({ id, mode, close }) {
	const queryClient = useQueryClient();
	const [successMessage, setSuccessMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);

	const deleteHandler = async () => {
		try {
			setErrorMessage("");
			setSubmitting(true);
			if (mode === "category") {
				const request = await fetch(`/api/admin/category/${id}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				});

				const response = await request.json();

				if (!request.ok) {
					throw new Error(response.error);
				}
				await queryClient.refetchQueries({ queryKey: ["categories"] });
				setSuccessMessage("Category deleted successfuly.");
			} else {
				const request = await fetch(`/api/admin/products/${id}`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
				});

				const response = await request.json();

				if (!request.ok) {
					throw new Error(response.error);
				}
				await queryClient.refetchQueries({ queryKey: ["products"] });
				setSuccessMessage("Product deleted successfuly.");
			}
			setSubmitting(false);
			setTimeout(() => {
				close();
			}, 1000);
		} catch (error) {
			setErrorMessage(error.message);
			setSubmitting(false);
			throw error;
		}
	};

	return (
		<div className="modal !flex">
			<div className="modal-content">
				<div>
					<p className="text-3xl font-bold text-center">
						{mode === "category"
							? "You are about to delete this category!"
							: "You are about to delete this product!"}
					</p>
					<p className="text-xl font-bold text-center text-[#787878]">
						Are you sure you want to coninue ?
					</p>
					<div className="flex items-center gap-3">
						<button
							onClick={() => {
								deleteHandler();
							}}
							type="submit"
							className="submit-button !bg-red-200 !text-red-500 "
							id="modalSubmitButton">
							{submitting ? "Deleting..." : "Yes, delete"}
						</button>
						<button
							onClick={() => {
								close();
							}}
							type="submit"
							className="submit-button !bg-[#eaeaea] !text-[#787878]"
							id="modalSubmitButton">
							Cancel
						</button>
					</div>
				</div>
				{successMessage && (
					<p
						id="registrationStatus"
						className="status-message !text-green-500 !text-xl">
						{successMessage}
					</p>
				)}
				{errorMessage && (
					<p
						id="registrationStatus"
						className="status-message !text-red-500 !text-xl">
						{errorMessage}
					</p>
				)}
			</div>
		</div>
	);
}
