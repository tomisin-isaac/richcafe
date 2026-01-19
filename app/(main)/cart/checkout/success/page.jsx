import React, { Suspense } from "react";
import VerifyPayment from "../../../../../components/cart/checkout/success/VerifyPayment";

export default function page() {
	return (
		<Suspense>
			<VerifyPayment />
		</Suspense>
	);
}
