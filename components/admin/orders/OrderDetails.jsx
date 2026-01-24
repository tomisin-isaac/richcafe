"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useAlert from "../../shared/hooks/useAlert";
import Spinner from "../../shared/Spinner";
import { useQueryClient } from "@tanstack/react-query";

export default function OrderDetails({ close, item }) {
	const { showAndHideAlert } = useAlert();
	const [submitting, setSubmitting] = useState(false);
	const router = useRouter();
	const queryClient = useQueryClient();

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

	const statusFlow = useMemo(
		() => ({
			pending: {
				nextStatus: "processing",
				label: "Mark as Processing",
				disabled: false,
			},
			processing: {
				nextStatus: "out_for_delivery",
				label: "Mark as Out for Delivery",
				disabled: false,
			},
			out_for_delivery: {
				nextStatus: "delivered",
				label: "Mark as Delivered",
				disabled: false,
			},
			delivered: {
				nextStatus: null,
				label: "Delivered",
				disabled: true,
			},
		}),
		[]
	);

	const current = statusFlow[item?.status] ?? statusFlow.pending;

	const updateStatusHandler = async () => {
		if (!current.nextStatus) return;

		try {
			setSubmitting(true);

			const request = await fetch(`/api/admin/order/${item._id}/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: current.nextStatus }),
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error || "Failed to update status");
			}

			showAndHideAlert("success", "Order status has been updated.");

			queryClient.refetchQueries({ queryKey: ["orders"] });

			setSubmitting(false);
			close?.(); // optional: close modal after update
		} catch (error) {
			setSubmitting(false);
			showAndHideAlert("error", error.message);
		}
	};

	return (
		<div className="modal !flex">
			<div className="modal-content !gap-0">
				<span onClick={close} className="close-button">
					&times;
				</span>

				<h2>Order Details</h2>

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

				{item.deliveryMethod && (
					<div className="!w-full bg-white px-8 flex flex-col gap-2 mt-5">
						<div className="flex flex-col gap-1">
							<h2 className="!text-left !text-xl !m-0 !p-0">Delivery Method</h2>
						</div>
						<div className="p-5 rounded-lg !outline-none text-2xl bg-[#eaeaea] flex items-center">
							<span className="px-3 w-max py-1 rounded-full flex items-center justify-center bg-blue-200 !text-blue-500">
								{item.deliveryMethod}
							</span>
						</div>
					</div>
				)}

				<div className="!w-full bg-white px-8 flex flex-col gap-2">
					<div className="flex flex-col gap-1">
						<h2 className="!text-left !text-xl !m-0 !p-0">Location</h2>
					</div>
					<div className="p-5 rounded-lg !outline-none text-2xl bg-[#eaeaea] flex items-center">
						<span>{item.location}</span>
					</div>
				</div>

				<div className="!w-full bg-white px-8 flex flex-col gap-2 mt-5">
					<div className="flex flex-col gap-1">
						<h2 className="!text-left !text-xl !m-0 !p-0">Hostel Name</h2>
					</div>
					<div className="p-5 rounded-lg !outline-none text-2xl bg-[#eaeaea] flex items-center">
						<span>{item.hostelName}</span>
					</div>
				</div>

				{item.deliveryInstructions && (
					<div className="!w-full bg-white px-8 flex flex-col gap-2 mt-5">
						<div className="flex flex-col gap-1">
							<h2 className="!text-left !text-xl !m-0 !p-0">
								Delivery Instruction
							</h2>
						</div>
						<div className="p-5 rounded-lg !outline-none text-2xl bg-[#eaeaea] flex items-center">
							<span>{item.deliveryInstructions}</span>
						</div>
					</div>
				)}

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
						<span className="text-2xl font-medium">
							₦{vat.toLocaleString()}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span className="text-xl">Total</span>
						<span className="text-3xl font-semibold">
							₦{total.toLocaleString()}
						</span>
					</div>
				</div>

				<div className="!w-full bg-white p-8 flex flex-col gap-5 mt-5">
					<button
						onClick={updateStatusHandler}
						disabled={current.disabled || submitting}
						type="button"
						className={`submit-button !h-[50px] rounded-lg !text-white flex items-center justify-center ${
							current.disabled
								? "!bg-gray-400 cursor-not-allowed"
								: "!bg-green-600"
						}`}
						id="orderStatusButton">
						{submitting ? <Spinner /> : current.label}
					</button>
				</div>
			</div>
		</div>
	);
}
