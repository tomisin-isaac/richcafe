import { Montserrat } from "next/font/google";
import RootProvider from "../../components/shared/providers/RootProvider";
import Link from "next/link";
import "../global.css";
import BottomNav from "../../components/shared/BottomNav";
import Toast from "../../components/shared/Toast";

const montserrat = Montserrat({
	subsets: ["latin"],
	weight: ["variable"],
	variable: "--font-mont",
});

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
					<Toast />
					{children}
					<BottomNav />
				</body>
			</RootProvider>
		</html>
	);
}
