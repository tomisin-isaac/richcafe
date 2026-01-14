import SignupPage from "../../../../components/auth/signup/SignupPage";
import { Suspense } from "react";
export default function Page() {
	return (
		<Suspense>
			<SignupPage />;
		</Suspense>
	);
}
