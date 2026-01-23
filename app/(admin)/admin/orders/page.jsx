import React, { Suspense } from "react";
import AdminOrders from "../../../../components/admin/orders/AdminOrders";

export default function page() {
	return (
		<Suspense>
			<AdminOrders />
		</Suspense>
	);
}
