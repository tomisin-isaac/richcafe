import React from "react";

export default function ChevronIcon({ stroke = "#0F172A" }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none">
			<path
				d="M19.5 8.25L12 15.75L4.5 8.25"
				stroke={stroke}
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	);
}
