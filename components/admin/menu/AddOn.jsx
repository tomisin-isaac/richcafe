"use client";
import React, { useEffect } from "react";
import { useFormikContext, Field, ErrorMessage } from "formik";
import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

export default function AddOn({ indexNumber, close }) {
	const { setFieldValue, values } = useFormikContext();
	const [selected, setSelected] = useState([]);
	const [addonName, setAddonName] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		if (values.addonGroups[indexNumber]) {
			setSelected(values.addonGroups[indexNumber].items ?? []);
			setAddonName(values.addonGroups[indexNumber].name ?? "");
		}
	}, [indexNumber]);

	const { data: products } = useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			const request = await fetch(`/api/admin/products`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response.products;
		},
		gcTime: 0,
	});

	const createOrUpdateAddon = () => {
		const newAddonGroups = [...values.addonGroups];

		const groupToModify = newAddonGroups[indexNumber]
			? newAddonGroups[indexNumber]
			: undefined;

		if (groupToModify) {
			groupToModify.isActive = selected.length > 0;
			groupToModify.name = addonName;
			groupToModify.items = selected;
		} else {
			newAddonGroups[indexNumber] = {
				isActive: selected.length > 0,
				name: addonName,
				items: selected,
			};
		}

		const groupToUpdate = newAddonGroups.filter(
			(g) => g.name.trim() !== "" && g.items.length > 0
		);

		setFieldValue("addonGroups", groupToUpdate);
		close();
	};

	const deleteAddon = () => {
		const newAddonGroups = [...values.addonGroups];

		const groupToUpdate = newAddonGroups.filter((g, i) => i !== indexNumber);

		setFieldValue("addonGroups", groupToUpdate);
		close();
	};

	return (
		<div className="w-full h-full">
			<div className="mb-5">
				<button
					onClick={close}
					type="button"
					className="underline font-medium text-xl cursor-pointer">
					Go back
				</button>
			</div>
			<div className="form-group">
				<label htmlFor={`add-name-${indexNumber}`}>Name</label>
				<input
					value={addonName}
					onChange={(e) => setAddonName(e.target.value)}
					type="text"
					id={`add-name-${indexNumber}`}
				/>
			</div>
			<div className="form-group">
				<label>Products</label>
				{products &&
					products.map((product, idx) => {
						const productInSelected = selected.find(
							(t) => t.product === product._id
						);

						const isSelected = productInSelected !== undefined;

						return (
							<div
								key={idx}
								className="flex items-center justify-between mb-3 last:mb-0">
								<div className="flex items-center gap-3">
									<Image
										src={product.images[0]}
										alt="richcafe"
										width={50}
										height={50}
										className="w-[35px] h-[35px] rounded-lg"
									/>
									<span className="text-2xl">{product.name}</span>
								</div>
								<button
									onClick={() => {
										if (!isSelected) {
											setSelected([...selected, { product: product._id }]);
										} else {
											setSelected(
												selected.filter((it) => it.product !== product._id)
											);
										}
									}}
									type="button"
									className={`!w-max !h-max !py-[5px] !px-[10px] submit-button !text-xl ${
										isSelected ? "!bg-[#eaeaea] !text-[#787878]" : ""
									}`}>
									{!isSelected ? <span>Select</span> : <span>Remove</span>}
								</button>
							</div>
						);
					})}
			</div>
			<div className="flex items-center gap-3">
				{values.addonGroups[indexNumber] !== undefined && (
					<>
						<button
							onClick={() => {
								createOrUpdateAddon();
							}}
							type="submit"
							className="submit-button"
							id="modalSubmitButton">
							Update Addon
						</button>
						<button
							onClick={() => {
								deleteAddon();
							}}
							type="submit"
							className="submit-button !bg-red-200 !text-red-500 "
							id="modalSubmitButton">
							Delete Addon
						</button>
					</>
				)}
				{values.addonGroups[indexNumber] === undefined && (
					<button
						onClick={() => {
							createOrUpdateAddon();
						}}
						type="submit"
						className="submit-button"
						id="modalSubmitButton">
						Create add-on
					</button>
				)}
			</div>
			{errorMessage && (
				<p
					id="registrationStatus"
					className="status-message !text-red-500 !text-xl">
					{errorMessage}
				</p>
			)}
		</div>
	);
}
