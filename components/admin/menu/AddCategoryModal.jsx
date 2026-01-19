"use client";
import React, { useEffect, useState } from "react";
import { Formik, Form, ErrorMessage, Field } from "formik";
import { createCategorySchema } from "../../../req-validators/category";
import ShortUniqueId from "short-unique-id";
import { useQueryClient } from "@tanstack/react-query";

export default function AddCategoryModal({ close, editCategory }) {
	const [catImage, setCatImage] = useState({ file: null, url: "" });
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const queryClient = useQueryClient();

	const initialValues = {
		name: editCategory?.name ?? "",
		image: editCategory?.image ?? "",
	};

	useEffect(() => {
		if (editCategory) {
			setCatImage({ file: null, url: editCategory.image });
		}
	}, [editCategory]);

	const submitHandler = async (values) => {
		try {
			setErrorMessage("");

			if (!catImage.url) {
				throw new Error("Category Image is required.");
			}

			let data = { ...values };

			if (catImage.file) {
				const { randomUUID } = new ShortUniqueId({
					dictionary: "hex",
					length: 12,
				});
				const fileExtension = catImage.file.type.split("/")[1];
				const key = `categories/${randomUUID()}.${fileExtension}`;
				const uploadUrlRes = await getUploadUrl(key, catImage.file.type);
				await fetch(uploadUrlRes.url, {
					method: "PUT",
					headers: {
						"Content-Type": catImage.file.type,
					},
					body: catImage.file,
				});

				data = {
					...data,
					image: `${process.env.NEXT_PUBLIC_S3_BUCKET_PREFIX}${key}`,
				};
			}

			let request;

			if (editCategory) {
				request = await fetch(`/api/admin/category/${editCategory._id}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});
			} else {
				request = await fetch(`/api/admin/category`, {
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
				editCategory
					? "Category updated successfuly."
					: "Category created successfuly."
			);

			setTimeout(() => {
				close();
			}, 1000);

			await queryClient.refetchQueries({ queryKey: ["categories"] });
		} catch (error) {
			setErrorMessage(error.message);
			console.log(error);
		}
	};

	const getUploadUrl = async (key, contentType) => {
		try {
			const request = await fetch(`/api/admin/presign`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ key, contentType }),
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response;
		} catch (error) {
			throw error;
		}
	};

	return (
		<div id="addCategoryModal" className="modal !flex">
			<div className="modal-content">
				<span onClick={close} className="close-button">
					&times;
				</span>
				<h2 id="categoryModalTitle">
					{!editCategory ? "Add New Category" : "Update Category"}
				</h2>
				<Formik
					validationSchema={createCategorySchema}
					initialValues={initialValues}
					onSubmit={submitHandler}>
					{({ isSubmitting }) => (
						<Form id="addCategoryForm">
							<div className="form-group">
								<label htmlFor="categoryTitle">Category Name:</label>
								<Field
									placeholder="Category Name"
									type="text"
									id="categoryTitle"
									name="name"
								/>
								<ErrorMessage
									component={"p"}
									name="name"
									className="text-xl text-red-500 mt-2"
								/>
							</div>
							<div className="form-group">
								<label htmlFor="categoryImage">Category Image:</label>
								<input
									type="file"
									id="categoryImage"
									name="categoryImage"
									accept="image/*"
									multiple={false}
									onChange={(e) => {
										if (e.target.files) {
											const file = [...e.target.files][0];
											const blob = new Blob([file], {
												type: file.type,
											});
											const url = URL.createObjectURL(blob);
											setCatImage({ file, url });
											e.target.value = "";
										}
									}}
								/>
								{catImage.url && (
									<img
										id="categoryImagePreview"
										src={catImage.url}
										alt="Image Preview"
										className="!object-cover"
										style={{
											width: "100px",
											height: "100px",
											marginTop: "10px",
										}}
									/>
								)}
							</div>
							<button
								type="submit"
								className="submit-button"
								id="categoryModalSubmitButton">
								{isSubmitting
									? "Submitting..."
									: `${editCategory ? "Update Category" : "Add Category"}`}
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
