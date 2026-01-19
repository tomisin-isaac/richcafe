"use client";
import React, { useEffect, useState } from "react";
import { Formik, Form, ErrorMessage, Field } from "formik";
import { createCategorySchema } from "../../../req-validators/category";
import ShortUniqueId from "short-unique-id";
import { useQueryClient } from "@tanstack/react-query";
import { createLocationSchema } from "../../../req-validators/location";

export default function AddLocationModal({ close, editLocation }) {
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const queryClient = useQueryClient();

	const initialValues = {
		name: editLocation?.name ?? "",
		dayDeliveryFee: editLocation?.dayDeliveryFee ?? "",
		nightDeliveryFee: editLocation?.nightDeliveryFee ?? "",
	};

	const submitHandler = async (values) => {
		try {
			setErrorMessage("");

			let data = { ...values };

			let request;

			if (editLocation) {
				request = await fetch(`/api/admin/location/${editLocation._id}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});
			} else {
				request = await fetch(`/api/admin/location`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});
			}

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			setSuccessMessage(
				editLocation
					? "Location updated successfuly."
					: "Location created successfuly."
			);

			setTimeout(() => {
				close();
			}, 1000);

			await queryClient.refetchQueries({ queryKey: ["locations"] });
		} catch (error) {
			setErrorMessage(error.message);
			console.log(error);
		}
	};

	return (
		<div id="addCategoryModal" className="modal !flex">
			<div className="modal-content">
				<span onClick={close} className="close-button">
					&times;
				</span>
				<h2 id="categoryModalTitle">
					{!editLocation ? "Add Location" : "Update Location"}
				</h2>
				<Formik
					validationSchema={createLocationSchema}
					initialValues={initialValues}
					onSubmit={submitHandler}>
					{({ isSubmitting }) => (
						<Form id="addCategoryForm">
							<div className="form-group">
								<label htmlFor="name">Location Name:</label>
								<Field
									placeholder="Category Name"
									type="text"
									id="name"
									name="name"
								/>
								<ErrorMessage
									component={"p"}
									name="name"
									className="text-xl text-red-500 mt-2"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="dayDeliveryFee">Day Price(₦):</label>
								<Field
									placeholder="Day Price"
									type="number"
									id="dayDeliveryFee"
									name="dayDeliveryFee"
									min={0}
								/>
								<ErrorMessage
									component={"p"}
									name="dayDeliveryFee"
									className="text-xl text-red-500 mt-2"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="dayDeliveryFee">Night Price(₦):</label>
								<Field
									placeholder="Night Price"
									type="number"
									id="nightDeliveryFee"
									name="nightDeliveryFee"
									min={0}
								/>
								<ErrorMessage
									component={"p"}
									name="nightDeliveryFee"
									className="text-xl text-red-500 mt-2"
								/>
							</div>
							<button
								type="submit"
								className="submit-button"
								id="categoryModalSubmitButton">
								{isSubmitting
									? "Submitting..."
									: `${editLocation ? "Update Location" : "Add Location"}`}
							</button>
							{errorMessage && (
								<p
									id="registrationStatus"
									className="status-message !text-red-500 !text-xl">
									{errorMessage}
								</p>
							)}
							{successMessage && (
								<p
									id="registrationStatus"
									className="status-message !text-green-500 !text-xl">
									{successMessage}
								</p>
							)}
						</Form>
					)}
				</Formik>
			</div>
		</div>
	);
}
