import React, { Suspense } from "react";
import CustomersPage from "../../../../components/admin/customers/CustomersPage";

export default function page() {
	return (
		<Suspense>
			<CustomersPage />
		</Suspense>
	);
}
