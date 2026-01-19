import React, { Suspense } from "react";
import ProductDetails from "../../../components/product-details/ProductDetails";

export default function page() {
	return (
		<Suspense>
			<ProductDetails />
		</Suspense>
	);
}
