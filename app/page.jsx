import LoginPage from "../components/auth/login/LoginPage";
import { Suspense } from "react";
export default function Page() {
	return (
		<Suspense>
			<LoginPage />;
		</Suspense>
	);
}
