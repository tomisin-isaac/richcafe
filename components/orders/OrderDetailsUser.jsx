"use client";
import React from "react";
import Image from "next/image";

export default function OrderDetailsUser({ item }) {
	function moneyInt(n) {
		const x = Number(n);
		return Number.isFinite(x) ? Math.round(x) : 0;
	}

	function computeVat(subtotal) {
		// if you want 7.5% fixed for now:
		const rate = 0.075;
		return moneyInt(moneyInt(subtotal) * rate);
	}

	const subtotal = moneyInt(item?.pricing?.subtotal);
	const deliveryFee = moneyInt(item?.pricing?.deliveryFee);
	const vat = computeVat(subtotal);
	const total = subtotal + vat + deliveryFee;

	return (
		<>
			<div className="!w-full bg-white p-8 flex flex-col">
				{item.items.map((it, idx) => (
					<div key={idx} className="modal-cart-row">
						<div className="cart-item-left">
							<Image
								width={200}
								height={200}
								className="w-[40px] h-[40px]"
								src={it.productImage}
								alt={it.productName}
							/>
							<div>
								<div className="cart-item-name">{it.productName}</div>
								<div className="cart-item-size">
									{it.sizeName} • ₦{moneyInt(it.unitPrice).toLocaleString()}
								</div>
							</div>
						</div>
						<div className="cart-item-right">
							<div>Qty - {it.quantity}</div>
							<div className="flex items-center justify-between mt-3">
								<div>₦{moneyInt(it.lineTotal).toLocaleString()}</div>
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="!w-full bg-white px-8 pb-5 flex flex-col gap-2">
				<div className="flex flex-col gap-1">
					<h2 className="!text-left !text-xl !m-0 !p-0">Status</h2>
				</div>
				<span
					className={`px-3 w-max py-1 rounded-full flex items-center justify-center ${
						["pending", "processing", "out_for_delivery"].includes(item.status)
							? "bg-orange-200 text-orange-700"
							: ""
					} ${item.status === "cancelled" ? "bg-red-200 text-red-700" : ""} ${
						item.status === "delivered" ? "bg-green-200 text-green-700" : ""
					}`}>
					{item.status}
				</span>
			</div>
			<div className="!w-full bg-white px-8 pb-5 flex flex-col gap-2">
				<div className="flex flex-col gap-1">
					<h2 className="!text-left !text-xl !m-0 !p-0">Location</h2>
				</div>
				<div className="p-5 rounded-lg !outline-none text-2xl bg-[#eaeaea] flex items-center">
					<span>{item.location}</span>
				</div>
			</div>

			<div className="!w-full bg-white px-8 flex flex-col gap-2">
				<div className="flex flex-col gap-1">
					<h2 className="!text-left !text-xl !m-0 !p-0">Hostel Name</h2>
				</div>
				<div className="p-5 rounded-lg !outline-none text-2xl bg-[#eaeaea] flex items-center">
					<span>{item.hostelName}</span>
				</div>
			</div>

			<div className="!w-full bg-white p-8 flex flex-col gap-5">
				<div className="flex items-center justify-between">
					<span className="text-xl">Subtotal</span>
					<span className="text-2xl font-medium">
						₦{subtotal.toLocaleString()}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-xl">Delivery Fee</span>
					<span className="text-2xl font-medium">
						₦{deliveryFee.toLocaleString()}
					</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-xl">VAT</span>
					<span className="text-2xl font-medium">₦{vat.toLocaleString()}</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-xl">Total</span>
					<span className="text-3xl font-semibold">
						₦{total.toLocaleString()}
					</span>
				</div>
			</div>
		</>
	);
}
