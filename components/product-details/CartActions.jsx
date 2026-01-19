"use client";
import React, { useState } from "react";
import { useRootStore } from "../shared/providers/RootProvider";
import Spinner from "../shared/Spinner";
import useAlert from "../shared/hooks/useAlert";

export default function CartActions({ quantity, itemId }) {
	const [incrementing, setIncrementing] = useState(false);
	const [decrementing, setDecrementing] = useState(false);
	const { setState } = useRootStore();
	const { showAndHideAlert } = useAlert();

	const addToCartHandler = async (data, mode) => {
		try {
			if (mode === "inc") {
				setIncrementing(true);
			} else {
				setDecrementing(true);
			}
			const request = await fetch(`/api/customer/cart/items/${itemId}`, {
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

			setState({ cart: response.cart });

			showAndHideAlert("success", "Your cart has been updated.");

			if (mode === "inc") {
				setIncrementing(false);
			} else {
				setDecrementing(false);
			}
		} catch (error) {
			showAndHideAlert("error", error.message);
			if (mode === "inc") {
				setIncrementing(false);
			} else {
				setDecrementing(false);
			}
			throw error;
		}
	};

	return (
		<div className="flex items-center gap-3">
			<button
				onClick={() => {
					addToCartHandler({ quantity: quantity - 1 }, "decr");
				}}
				className="product-price-tag !flex !items-center !justify-center !min-w-[10px] !w-[30px] !h-[30px] !p-0 !m-0">
				{decrementing ? <Spinner /> : <span>-</span>}
			</button>
			<span className="text-xl font-medium">{quantity}</span>
			<button
				onClick={() => {
					addToCartHandler({ quantity: quantity + 1 }, "inc");
				}}
				className="product-price-tag !flex !items-center ! justify-center !min-w-[10px] !w-[30px] !h-[30px] !p-0 !m-0">
				{incrementing ? <Spinner /> : <span>+</span>}
			</button>
		</div>
	);
}
