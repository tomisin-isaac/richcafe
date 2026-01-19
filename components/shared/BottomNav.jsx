"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRootStore } from "./providers/RootProvider";
import { usePathname } from "next/navigation";

export default function BottomNav() {
	const { setState, cart } = useRootStore();
	const pathname = usePathname();

	const isHome = pathname === "/" || pathname.startsWith("/product-details");
	const isCart = pathname.startsWith("/cart");
	const isOrders = pathname.startsWith("/orders");
	const isSupport = pathname.startsWith("/support");
	const isProfile = pathname.startsWith("/profile");

	const { data } = useQuery({
		queryKey: ["cart"],
		queryFn: async () => {
			const request = await fetch(`/api/customer/cart`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response.cart;
		},
	});

	//console.log(data, "bottom nav");

	useEffect(() => {
		if (data) {
			setState({ cart: data });
		}
	}, [data]);

	return (
		<nav className="user-dashboard-bottom-nav">
			<Link href="/" className={`${isHome ? "active" : ""}`}>
				<i className="fas fa-home"></i>
				<span>Home</span>
			</Link>
			<Link href="/cart" className={`relative ${isCart ? "active" : ""}`}>
				{cart && (
					<span className="text-white text-sm font-medium absolute top-[-3px] flex items-center justify-center w-[15px] h-[15px] rounded-full bg-green-500 right-[-5px]">
						{cart.items.length}
					</span>
				)}
				<i className="fas fa-shopping-cart"></i>
				<span>Cart</span>
			</Link>
			<Link href="/orders" className={`${isOrders ? "active" : ""}`}>
				<i className="fas fa-receipt"></i>
				<span>Orders</span>
			</Link>
			<Link href="/support" className={`${isSupport ? "active" : ""}`}>
				<i className="fas fa-headset"></i>
				<span>Support</span>
			</Link>
			<Link href="/profile" className={`${isProfile ? "active" : ""}`}>
				<i className="fas fa-user"></i>
				<span>Profile</span>
			</Link>
		</nav>
	);
}
