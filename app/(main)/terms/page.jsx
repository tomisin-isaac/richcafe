"use client";
import React, { Suspense } from "react";
import TermsPage from "../../../components/terms/TermsPage";

export default function Page() {
	return (
		<Suspense>
			<TermsPage />
		</Suspense>
	);
}
