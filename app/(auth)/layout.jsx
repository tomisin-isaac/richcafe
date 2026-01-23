import { Montserrat } from "next/font/google";
import "../global.css";
import RootProvider from "../../components/shared/providers/RootProvider";
import Toast from "../../components/shared/Toast";

const montserrat = Montserrat({
	subsets: ["latin"],
	weight: ["variable"],
	variable: "--font-mont",
});

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<RootProvider>
				<body className={`${montserrat.variable} font-mont`}>
					<Toast />
					{children}
				</body>
			</RootProvider>
		</html>
	);
}
