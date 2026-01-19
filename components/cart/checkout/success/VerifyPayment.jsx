"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useAlert from "../../../shared/hooks/useAlert";
import Spinner from "../../../shared/Spinner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function VerifyPayment() {
	const { showAndHideAlert } = useAlert();
	const [submitting, setSubmitting] = useState(true);
	const router = useRouter();
	const searchparams = useSearchParams();
	const reference = searchparams.get("reference");
	const queryClient = useQueryClient();

	useEffect(() => {
		if (reference) {
			checkoutHandler(reference);
		}
	}, [reference]);

	const checkoutHandler = async (ref) => {
		try {
			setSubmitting(true);

			const request = await fetch(`/api/customer/checkout/verify`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					reference: ref,
				}),
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			setSubmitting(false);

			showAndHideAlert("success", "Your order has been placed successfully.");

			queryClient.refetchQueries({ queryKey: ["cart"] });

			//console.log(response);

			router.replace("/");
		} catch (error) {
			setSubmitting(false);
			showAndHideAlert("error", error.message);
		}
	};

	return (
		<div className="product-container !w-full">
			<div className="!w-full bg-white p-8 flex-col h-[300px] flex items-center justify-center">
				<Spinner bg={"before:!bg-blue-800"} />
				<p className="text-xl">We are verifying your payment...</p>
			</div>
		</div>
	);
}
