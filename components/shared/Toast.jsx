"use client";
import React from "react";
import { useRootStore } from "./providers/RootProvider";

export default function Toast() {
	const { alert } = useRootStore();

	return (
		<div
			id="toast"
			className={`toast  ${alert && alert.show ? "show" : "hidden"} ${
				alert && alert.type === "success" ? "!bg-green-800" : "!bg-red-600"
			}`}>
			{alert.message}
		</div>
	);
}
