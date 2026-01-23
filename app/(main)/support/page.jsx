import React, { Suspense } from "react";
import SupportPage from "../../../components/support/SupportPage";

export default function page() {
	return (
		<Suspense>
			<SupportPage />
		</Suspense>
	);
}
