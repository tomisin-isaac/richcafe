import { Montserrat } from "next/font/google";
import "../global.css";
import Sidebar from "../../components/shared/admin/Sidebar";
import { Suspense } from "react";
import RootProvider from "../../components/shared/providers/RootProvider";

const montserrat = Montserrat({
	subsets: ["latin"],
	weight: ["variable"],
	variable: "--font-mont",
});

export const viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
};

export const metadata = {
	title: "Rich Cafe",
	description: "Order Our Restaurant food, takeaway and Pizza.",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<link
				rel="stylesheet"
				precedence="first"
				href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
			/>
			<RootProvider>
				<body className={`${montserrat.variable} font-mont`}>
					<div className="admin-dashboard-layout">
						<Suspense>
							<Sidebar />
						</Suspense>
						<main className="main-content">{children}</main>
					</div>
				</body>
			</RootProvider>
		</html>
	);
}
