"use client";
import React, { useEffect, useState } from "react";
import { Formik, Form, ErrorMessage, Field } from "formik";
import { createProductSchema } from "../../../req-validators/product";
import ShortUniqueId from "short-unique-id";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AddOn from "./AddOn";

export default function AddProductModal({ close, editProduct }) {
	const [prodImage, setProdImage] = useState({ file: null, url: "" });
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [addon, setAddon] = useState(false);
	const [addonIndex, setAddonIndex] = useState(0);
	const queryClient = useQueryClient();

	const initialValues = {
		name: editProduct?.name ?? "",
		category: editProduct?.category._id ?? "",
		sizes: editProduct?.sizes ?? [{ name: "", price: 0 }],
		preparationTimeMinutes: editProduct?.preparationTimeMinutes ?? "",
		isAvailable: editProduct ? editProduct.isAvailable : true,
		images: editProduct?.images ?? [],
		addonGroups: editProduct?.addonGroups ?? [],
	};

	useEffect(() => {
		if (editProduct) {
			setProdImage({ file: null, url: editProduct.images[0] });
		}
	}, [editProduct]);

	const { data: categories } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const request = await fetch(`/api/admin/category`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response.categories;
		},
		gcTime: 0,
	});

	const submitHandler = async (values) => {
		try {
			setErrorMessage("");

			if (!prodImage.url) {
				throw new Error("Product Image is required.");
			}

			let data = { ...values };

			if (prodImage.file) {
				const { randomUUID } = new ShortUniqueId({
					dictionary: "hex",
					length: 12,
				});
				const fileExtension = prodImage.file.type.split("/")[1];
				const key = `products/${randomUUID()}.${fileExtension}`;
				const uploadUrlRes = await getUploadUrl(key, prodImage.file.type);
				await fetch(uploadUrlRes.url, {
					method: "PUT",
					headers: {
						"Content-Type": prodImage.file.type,
					},
					body: prodImage.file,
				});

				data = {
					...data,
					images: [`${process.env.NEXT_PUBLIC_S3_BUCKET_PREFIX}${key}`],
				};
			}

			let request;

			if (editProduct) {
				request = await fetch(`/api/admin/products/${editProduct._id}`, {
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(data),
				});
			} else {
				request = await fetch(`/api/admin/products`, {
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
				editProduct
					? "Product updated successfuly."
					: "Product created successfuly."
			);

			setTimeout(() => {
				close();
			}, 1000);

			await queryClient.refetchQueries({ queryKey: ["products"] });
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
		<div id="addItemModal" className="modal !flex">
			<div className="modal-content">
				<span onClick={close} className="close-button">
					&times;
				</span>
				<h2>{!editProduct ? "Add New Item" : "Update Item"}</h2>
				<Formik
					validationSchema={createProductSchema}
					initialValues={initialValues}
					onSubmit={submitHandler}>
					{({ isSubmitting, values, setFieldValue }) => (
						<Form id="addItemForm">
							{!addon && (
								<>
									<div className="form-group">
										<label htmlFor="itemName">Item Name:</label>
										<Field type="text" id="itemName" name="name" />
										<ErrorMessage
											component={"p"}
											name="name"
											className="text-xl text-red-500 mt-2"
										/>
									</div>
									<div className="form-group">
										<label htmlFor="itemName">Category:</label>
										<Field
											as="select"
											type="text"
											id="itemName"
											name="category">
											<option disabled value={""}>
												Select category
											</option>
											{categories &&
												categories.map((c, i) => (
													<option key={i} value={c._id}>
														{c.name}
													</option>
												))}
										</Field>
										<ErrorMessage
											component={"p"}
											name="name"
											className="text-xl text-red-500 mt-2"
										/>
									</div>

									<div className="form-group" id="itemSizesContainer">
										<label>Sizes & Prices:</label>
										{values.sizes.map((s, i) => (
											<React.Fragment key={i}>
												<div
													className="size-price-input !flex !items-center gap-3"
													data-size-id="1">
													<Field
														type="text"
														name={`sizes[${i}].name`}
														className="itemSize !w-[45%]"
														placeholder="Size (e.g., Small)"
													/>
													<Field
														type="number"
														name={`sizes[${i}].price`}
														className="itemPrice !w-[45%]"
														placeholder="Price (NGN)"
														step="1"
														min={0}
													/>
													{i > 0 && (
														<button
															onClick={() => {
																setFieldValue(
																	"sizes",
																	[...values.sizes].filter(
																		(st, idx) => idx !== i
																	)
																);
															}}
															type="button"
															className="remove-size-btn">
															<i className="fas fa-times-circle"></i>
														</button>
													)}
												</div>
												<ErrorMessage
													component={"p"}
													name={`sizes[${i}].name`}
													className="text-xl text-red-500 mt-2 !mb-0"
												/>
												<ErrorMessage
													component={"p"}
													name={`sizes[${i}].price`}
													className="text-xl text-red-500 mt-2 !mb-0"
												/>
											</React.Fragment>
										))}
										<button
											type="button"
											onClick={() => {
												setFieldValue("sizes", [
													...values.sizes,
													{ name: "", price: 0 },
												]);
											}}
											id="addSizeBtn"
											className="add-size-button !mt-3">
											<i className="fas fa-plus-circle"></i> Add Another Size
										</button>
									</div>

									<div className="form-group">
										<label htmlFor="itemPrepTime">
											Preparation Time (min):
										</label>
										<Field
											type="number"
											id="itemPrepTime"
											name="preparationTimeMinutes"
										/>
										<ErrorMessage
											component={"p"}
											name={`preparationTimeMinutes`}
											className="text-xl text-red-500 mt-2 !mb-0"
										/>
									</div>
									<div className="form-group">
										<label htmlFor="itemImage">Upload Image:</label>
										<input
											type="file"
											id="itemImage"
											name="itemImage"
											accept="image/*"
											multiple={false}
											onInput={(e) => {
												if (e.currentTarget.files) {
													const file = [...e.currentTarget.files][0];
													const blob = new Blob([file], {
														type: file.type,
													});
													const url = URL.createObjectURL(blob);
													setProdImage({ file, url });
													//e.target.value = "";
												}
											}}
										/>
										{prodImage.url && (
											<img
												id="categoryImagePreview"
												src={prodImage.url}
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
									<div className="form-group" id="itemStatusGroup">
										<label>Availability:</label>
										<div className="flex items-center gap-5 !m-0">
											<div className="flex items-center gap-2">
												<label htmlFor="available" className="!mb-0">
													Is Available
												</label>
												<input
													onChange={(e) => {
														if (e.target.checked) {
															setFieldValue("isAvailable", true);
														}
													}}
													checked={values.isAvailable}
													type="radio"
													name="availability"
													id="available"
													className="!m-0 !p-0"
												/>
											</div>
											<div className="flex items-center gap-2">
												<label htmlFor="not_available" className="!mb-0">
													Not Available
												</label>
												<input
													checked={!values.isAvailable}
													onChange={(e) => {
														if (e.target.checked) {
															setFieldValue("isAvailable", false);
														}
													}}
													type="radio"
													name="availability"
													id="not_available"
													className="!m-0 !p-0"
												/>
											</div>
										</div>
										<ErrorMessage
											component={"p"}
											name={`isAvailable`}
											className="text-xl text-red-500 mt-2 !mb-0"
										/>
									</div>

									<div className="form-group">
										<label htmlFor="itemPrepTime">Add ons:</label>
										<p className="text-[#787878] text-xl">
											Add-ons are extra items customers can add to this product
											(e.g., drinks or sides). They’ll be able to choose the
											add-on and its size at checkout.
										</p>
										{values.addonGroups.map((g, idx) => (
											<div
												key={idx}
												className="flex items-center justify-between">
												<span className="text-xl font-medium">
													{g.name} - {g.items.length} Item
													{g.items.length > 1 ? "s" : ""}
												</span>
												<i
													onClick={() => {
														setAddon(true);
														setAddonIndex(idx);
													}}
													className="fas fa-edit edit-item-icon text-2xl"></i>
											</div>
										))}
										<button
											type="button"
											onClick={() => {
												setAddon(true);
												setAddonIndex(values.addonGroups.length);
											}}
											id="addSizeBtn"
											className="add-size-button !mt-2">
											<i className="fas fa-plus-circle"></i> Create add-on
										</button>
									</div>

									<button
										type="submit"
										className="submit-button"
										id="modalSubmitButton">
										{isSubmitting
											? "Submitting..."
											: `${editProduct ? "Update Product" : "Add Product"}`}
									</button>
								</>
							)}

							{addon && (
								<AddOn
									close={() => {
										setAddon(false);
									}}
									indexNumber={addonIndex}
								/>
							)}

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
