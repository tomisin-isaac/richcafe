import React from "react";
import { useRootStore } from "../providers/RootProvider";

export default function useAlert() {
	const { alert, setState } = useRootStore();
	const showAndHideAlert = (type, message) => {
		setState({
			alert: {
				show: true,
				type,
				message,
			},
		});

		setTimeout(() => {
			setState({
				alert: {
					show: false,
					type,
					message,
				},
			});
		}, 5000);
	};
	return {
		showAndHideAlert,
		alert,
	};
}
