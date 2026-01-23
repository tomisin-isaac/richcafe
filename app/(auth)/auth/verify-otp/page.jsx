import React, { Suspense } from "react";
import VerifyOtp from "../../../../components/auth/verify-otp/VerifyOtp";

export default function page() {
	return (
		<Suspense>
			<VerifyOtp />
		</Suspense>
	);
}
