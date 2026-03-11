import React, { Suspense } from "react";
import CategoryProducts from "../../../../components/categories/CategoryProducts";

export default function page() {
	return (
		<Suspense>
			<CategoryProducts />
		</Suspense>
	);
}
