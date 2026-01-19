"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRootStore } from "../shared/providers/RootProvider";
import { useState } from "react";
import CartItem from "./CartItem";

export default function CartPage() {
	const { cart } = useRootStore();
	if (!cart) {
		return null;
	}
	return (
		<div className="product-container !w-full">
			<header className="product-header">
				<h1 className="product-title !m-0 !p-0" id="productCategoryTitle">
					My Cart
				</h1>
			</header>
			<div className="!w-full bg-white p-8 flex flex-col">
				{cart?.items.map((it, idx) => {
					return <CartItem key={idx} item={it} />;
				})}
			</div>
			<div className="!w-full bg-white p-8 flex flex-col gap-5 mt-5">
				<div className="flex items-center justify-between">
					<span className="text-xl">Subtotal</span>
					<span className="text-2xl font-medium">
						₦{cart.pricing.subtotal.toLocaleString()}
					</span>
				</div>
			</div>
			<div className="!w-full bg-white p-8 flex flex-col gap-5 mt-5">
				<Link
					href={"/cart/checkout"}
					className="submit-button flex items-center justify-center !bg-green-600 !h-[50px] rounded-lg !text-white"
					id="categoryModalSubmitButton">
					Proceed to checkout
				</Link>
			</div>
		</div>
	);
}
