"use client";
import React, { useState } from "react";
import { useRootStore } from "../shared/providers/RootProvider";
import useAlert from "../shared/hooks/useAlert";

export default function AddToCart({ productId, sizeId }) {
	const [submitting, setSubmitting] = useState(false);
	const { setState } = useRootStore();
	const { showAndHideAlert } = useAlert();

	const addToCartHandler = async (data) => {
		try {
			setSubmitting(true);
			const request = await fetch(`/api/customer/cart/items`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data),
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			setState({ cart: response.cart });

			showAndHideAlert("success", "Your cart has been updated.");

			setSubmitting(false);
		} catch (error) {
			showAndHideAlert("error", error.message);
			setSubmitting(false);
			throw error;
		}
	};

	return (
		<button
			onClick={() => {
				addToCartHandler({ productId, sizeId, quantity: 1 });
			}}
			className="product-price-tag">
			<span>{submitting ? "Adding..." : "Add to cart"}</span>
		</button>
	);
}
