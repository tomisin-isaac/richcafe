import React, { Suspense } from "react";
import CartPage from "../../../components/cart/CartPage";

export default function page() {
	return (
		<Suspense>
			<CartPage />
		</Suspense>
	);
}
