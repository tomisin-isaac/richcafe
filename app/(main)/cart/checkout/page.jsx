import React, { Suspense } from "react";
import CheckoutPage from "../../../../components/cart/checkout/CheckoutPage";

export default function page() {
	return (
		<Suspense>
			<CheckoutPage />
		</Suspense>
	);
}
