"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useRef } from "react";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";

const client = new QueryClient();
const RootContext = createContext(null);

const createRootStore = () =>
	createStore()((set) => ({
		alert: {
			show: false,
			message: "",
			type: "error",
		},
		currentProduct: null,
		cart: null,
		setState: (val) => set((state) => ({ ...state, ...val })),
	}));

const RootProvider = ({ children }) => {
	const rootStoreRef = useRef(null);

	if (!rootStoreRef.current) {
		rootStoreRef.current = createRootStore();
	}

	return (
		<QueryClientProvider client={client}>
			<RootContext.Provider value={rootStoreRef.current}>
				{children}
			</RootContext.Provider>
		</QueryClientProvider>
	);
};

// 4. Hook to access store
export const useRootStore = () => {
	const ctx = useContext(RootContext);
	if (!ctx) throw new Error("useRootStore must be used within RootProvider");
	return useStore(ctx);
};

export default RootProvider;
