import { Montserrat } from "next/font/google";
import "../global.css";

const montserrat = Montserrat({
	subsets: ["latin"],
	weight: ["variable"],
	variable: "--font-mont",
});

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<body className={`${montserrat.variable} font-mont`}>{children}</body>
		</html>
	);
}
