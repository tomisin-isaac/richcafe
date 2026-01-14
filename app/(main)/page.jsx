import { Suspense } from "react";
import Homepage from "../../components/homepage/Homepage";
export default function Page() {
	return (
		<Suspense>
			<Homepage />
		</Suspense>
	);
}
