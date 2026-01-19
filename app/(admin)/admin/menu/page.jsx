import { Suspense } from "react";
import AdminMenu from "../../../../components/admin/menu/AdminMenu";
export default function Page() {
	return (
		<Suspense>
			<AdminMenu />
		</Suspense>
	);
}
