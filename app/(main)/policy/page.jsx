"use client";
import React, { Suspense } from "react";
import TermsPage from "../../../components/terms/TermsPage";
import PolicyPage from "../../../components/policy/PolicyPage";

export default function Page() {
	return (
		<Suspense>
			<PolicyPage />
		</Suspense>
	);
}
