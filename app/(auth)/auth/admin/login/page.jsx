import { Suspense } from "react";
import AdminLoginPage from "../../../../../components/auth/admin/login/AdminLoginPage";
export default function Page() {
	return (
		<Suspense>
			<AdminLoginPage />
		</Suspense>
	);
}
