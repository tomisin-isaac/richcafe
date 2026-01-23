import React, { Suspense } from "react";
import ProfilePage from "../../../components/profile/ProfilePage";

export default function page() {
	return (
		<Suspense>
			<ProfilePage />
		</Suspense>
	);
}
