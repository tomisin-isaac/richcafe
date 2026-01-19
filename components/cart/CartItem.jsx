"use client";
import React from "react";
import Image from "next/image";
import { useState } from "react";
import { useRootStore } from "../shared/providers/RootProvider";
import Spinner from "../shared/Spinner";
import CartActions from "../product-details/CartActions";
export default function CartItem({ item, showActions = true }) {
	const [incrementing, setIncrementing] = useState(false);

	const { setState } = useRootStore();

	const addToCartHandler = async () => {
		try {
			setIncrementing(true);
			const request = await fetch(`/api/customer/cart/items/${item._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			setState({ cart: response.cart });

			setIncrementing(false);
		} catch (error) {
			setIncrementing(false);
			throw error;
		}
	};

	return (
		<div className="modal-cart-row">
			<div className="cart-item-left">
				<Image
					width={200}
					height={200}
					className="w-[40px] h-[40px]"
					src={item.productImage}
					alt="richcafe"
				/>
				<div>
					<div className="cart-item-name">{item.productName}</div>
					<div className="cart-item-size">
						{item.sizeName} • ₦{item.unitPrice}
					</div>
				</div>
			</div>
			<div className="cart-item-right">
				{showActions && (
					<CartActions quantity={item.quantity} itemId={item._id} />
				)}
				{!showActions && <div>Qty - {item.quantity}</div>}
				<div className="flex items-center justify-between mt-3">
					<div>₦{item.lineTotal}</div>
					{showActions && (
						<button
							onClick={addToCartHandler}
							className="cart-remove-btn"
							data-idx="${idx}"
							title="Remove">
							{incrementing ? <Spinner /> : "✕"}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
