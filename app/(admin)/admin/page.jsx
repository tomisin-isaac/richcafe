import { Suspense } from "react";
import AdminOverview from "../../../components/admin/overview/AdminOverview";
export default function Page() {
	return (
		<Suspense>
			<AdminOverview />
		</Suspense>
	);
}
