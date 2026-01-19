import React, { Suspense } from "react";
import AdminSettings from "../../../../components/admin/settings/AdminSettings";

export default function page() {
	return (
		<Suspense>
			<AdminSettings />
		</Suspense>
	);
}
