import React, { Suspense } from "react";
import CategoriesPage from "../../../components/categories/CategoriesPage";

export default function page() {
	return (
		<Suspense>
			<CategoriesPage />
		</Suspense>
	);
}
