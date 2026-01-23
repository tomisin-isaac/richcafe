import React, { Suspense } from "react";
import OrderPage from "../../../components/orders/OrderPage";

export default function page() {
	return (
		<Suspense>
			<OrderPage />
		</Suspense>
	);
}
