"use client";
import React, { useState } from "react";
import { useRootStore } from "../../shared/providers/RootProvider";
import Link from "next/link";
import CartItem from "../CartItem";
import { useQuery } from "@tanstack/react-query";
import useAlert from "../../shared/hooks/useAlert";
import Spinner from "../../shared/Spinner";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
	const { cart } = useRootStore();
	const [selectedLocation, setSelectedLocation] = useState(null);
	const [hostelName, setHostelName] = useState("");
	const [deliveryMethod, setDeliveryMethod] = useState("home");
	const [instructions, setInstructions] = useState("");
	const { showAndHideAlert } = useAlert();
	const [submitting, setSubmitting] = useState(false);
	const router = useRouter();

	const { data: locations, isFetching: locationsLoading } = useQuery({
		queryKey: ["locations"],
		queryFn: async () => {
			const request = await fetch(`/api/customer/location`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response.locations;
		},
		gcTime: 0,
	});

	if (!cart) {
		return null;
	}

	function moneyInt(n) {
		const x = Number(n);
		return Number.isFinite(x) ? Math.round(x) : 0;
	}

	function computeVat(subtotal) {
		// Optional: set VAT_RATE="0.075" (7.5%). Default 0 if not set.
		const rate = Number(process.env.VAT_RATE ?? 0.075);
		if (!Number.isFinite(rate) || rate <= 0) return 0;
		return moneyInt(subtotal * rate);
	}

	function getHourInLagos(date = new Date()) {
		const parts = new Intl.DateTimeFormat("en-US", {
			timeZone: "Africa/Lagos",
			hour: "2-digit",
			hour12: false,
		}).formatToParts(date);

		const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";
		return Number(hourStr);
	}

	function isNightFeeHour(hour) {
		// night: 12:00am (0) to before 7:00am (7)
		return hour >= 0 && hour < 7;
	}

	const subtotal = cart?.pricing.subtotal;
	const vat = computeVat(cart?.pricing.subtotal);
	const hour = getHourInLagos(new Date());
	let deliveryFee = 0;

	if (deliveryMethod === "home") {
		deliveryFee = isNightFeeHour(hour)
			? moneyInt(selectedLocation?.nightDeliveryFee)
			: moneyInt(selectedLocation?.dayDeliveryFee);
	}

	const total = subtotal + vat + deliveryFee;

	const checkoutHandler = async () => {
		try {
			setSubmitting(true);
			if (deliveryMethod === "home" && !selectedLocation) {
				throw new Error("Please select a location");
			}

			if (!hostelName) {
				throw new Error("Please enter a valid hostel name");
			}

			const request = await fetch(`/api/customer/checkout`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					locationId: selectedLocation._id,
					hostelName: hostelName,
					deliveryMethod,
					deliveryInstructions: instructions,
				}),
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			setSubmitting(false);

			showAndHideAlert("success", "Order Ready! Please proceed with payment.");

			//console.log(response);

			router.replace(response.paystack.data.authorization_url);
		} catch (error) {
			setSubmitting(false);
			showAndHideAlert("error", error.message);
		}
	};

	return (
		<div className="product-container !w-full">
			<header className="product-header">
				<Link
					href={"/cart"}
					className="product-back-btn"
					id="productBackBtn"
					aria-label="Go back">
					<i className="fas fa-arrow-left"></i>
				</Link>
				<h1 className="product-title !m-0 !p-0" id="productCategoryTitle">
					Checkout
				</h1>
			</header>
			<div className="!w-full bg-white p-8 flex flex-col">
				{cart?.items.map((it, idx) => {
					return <CartItem showActions={false} key={idx} item={it} />;
				})}
			</div>
			<div className="!w-full bg-white p-8 flex flex-col gap-5 mt-5">
				<div className="flex flex-col gap-1 pb-3 border-b border-b-[#eaeaea]">
					<h2 className="!m-0 !p-0">Delivery Method</h2>
					<span className="text-xl text-[#787878]">
						Choose how you want your order delivered.
					</span>
				</div>
				{[
					{ title: "Home Delivery", key: "home" },
					{ title: "Pickup", key: "pickup" },
				].map((loc, idx) => {
					const isSelected = deliveryMethod === loc.key;
					return (
						<div
							key={idx}
							className="flex items-center justify-between mb-3 last:mb-0">
							<div className="flex items-center gap-3">
								<span className="text-2xl">{loc.title}</span>
							</div>
							<button
								onClick={() => {
									if (!isSelected) {
										setDeliveryMethod(loc.key);
									} else {
										setDeliveryMethod(null);
									}
								}}
								type="button"
								className={`rounded-lg !w-max !h-max !py-[5px] !px-[10px] submit-button !text-xl ${
									isSelected
										? "!bg-[#eaeaea] !text-[#787878]"
										: "!bg-blue-950 !text-white"
								}`}>
								{!isSelected ? <span>Select</span> : <span>Remove</span>}
							</button>
						</div>
					);
				})}
			</div>
			{deliveryMethod === "home" && (
				<div className="!w-full bg-white p-8 flex flex-col gap-5 mt-5">
					<div className="flex flex-col gap-1 pb-3 border-b border-b-[#eaeaea]">
						<h2 className="!m-0 !p-0">Select Location</h2>
						<span className="text-xl text-[#787878]">
							Choose where you want your order delivered. Select a location
							below, then enter your hostel name.
						</span>
					</div>
					{locations &&
						locations.map((loc, idx) => {
							const isSelected = selectedLocation?._id === loc._id;
							return (
								<div
									key={idx}
									className="flex items-center justify-between mb-3 last:mb-0">
									<div className="flex items-center gap-3">
										<span className="text-2xl">{loc.name}</span>
									</div>
									<button
										onClick={() => {
											if (!isSelected) {
												setSelectedLocation(loc);
											} else {
												setSelectedLocation(null);
											}
										}}
										type="button"
										className={`rounded-lg !w-max !h-max !py-[5px] !px-[10px] submit-button !text-xl ${
											isSelected
												? "!bg-[#eaeaea] !text-[#787878]"
												: "!bg-blue-950 !text-white"
										}`}>
										{!isSelected ? <span>Select</span> : <span>Remove</span>}
									</button>
								</div>
							);
						})}
				</div>
			)}
			<div className="!w-full bg-white p-8 flex flex-col gap-2 mt-5">
				<div className="flex flex-col gap-1">
					<h2 className="!m-0 !p-0">Hostel Name</h2>
					<span className="text-xl text-[#787878]">
						Enter your hostel name.
					</span>
				</div>
				<input
					value={hostelName}
					onChange={(e) => {
						setHostelName(e.target.value);
					}}
					className="border-b border-b-[#d3d3d3] h-[45px] !outline-none text-2xl"
					type="text"
					id={`hostel-number`}
					placeholder="Hostel Name"
				/>
			</div>
			<div className="!w-full bg-white p-8 flex flex-col gap-2 mt-5">
				<div className="flex flex-col gap-1">
					<h2 className="!m-0 !p-0">Delivery Instructions</h2>
				</div>
				<textarea
					value={instructions}
					onChange={(e) => {
						setInstructions(e.target.value);
					}}
					className="border-b border-b-[#d3d3d3] h-[95px] !outline-none text-2xl !resize-none"
					type="text"
					id={`hostel-number`}
					placeholder="E.g Calling Number, Gatepass code... etc"
				/>
			</div>
			<div className="!w-full bg-white p-8 flex flex-col gap-5 mt-5">
				<div className="flex items-center justify-between">
					<span className="text-xl">Subtotal</span>
					<span className="text-2xl font-medium">
						₦{subtotal.toLocaleString()}
					</span>
				</div>
				{selectedLocation && (
					<div className="flex items-center justify-between">
						<span className="text-xl">Delivery Fee</span>
						<span className="text-2xl font-medium">
							₦{deliveryFee.toLocaleString()}
						</span>
					</div>
				)}
				<div className="flex items-center justify-between">
					<span className="text-xl">Vat</span>
					<span className="text-2xl font-medium">
						₦{Number(vat).toLocaleString()}
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
					onClick={checkoutHandler}
					type="submit"
					className="submit-button !bg-green-600 !h-[50px] rounded-lg !text-white flex items-center justify-center"
					id="categoryModalSubmitButton">
					{submitting ? <Spinner /> : "Proceed to checkout"}
				</button>
			</div>
		</div>
	);
}
