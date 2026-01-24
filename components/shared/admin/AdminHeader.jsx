"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";
import SidebarContent from "./SidebarContent";
import { useState } from "react";

export default function AdminHeader() {
	const pathname = usePathname();

	const isOverview = pathname === "/admin";
	const isMenu = pathname === "/admin/menu";
	const isOrders = pathname === "/admin/orders";
	const isCustomers = pathname === "/admin/customers";
	const isSettings = pathname === "/admin/settings";

	const [opened, setOpened] = useState(false);

	useEffect(() => {
		if (opened) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}

		return () => {
			document.body.style.overflow = "auto";
		};
	}, [opened]);

	return (
		<header className="dashboard-header">
			<div className="header-left">
				<button
					onClick={() => {
						setOpened(!opened);
					}}
					className="menu-toggle"
					id="menuToggle">
					<i className="fas fa-bars"></i>
				</button>
				{isOverview && (
					<h1 className="page-title !m-0 !p-0">Dashboard Overview</h1>
				)}
				{isMenu && <h1 className="page-title !m-0 !p-0">Menu Management</h1>}
				{isOrders && <h1 className="page-title !m-0 !p-0">Received Orders</h1>}
				{isCustomers && (
					<h1 className="page-title !m-0 !p-0">Customers List</h1>
				)}
				{isSettings && <h1 className="page-title !m-0 !p-0">Settings</h1>}
			</div>
			<div className="header-right">
				{/* <div className="search-box">
						<input type="text" placeholder="Search..." />
						<i className="fas fa-search"></i>
					</div> */}
				{/* <i className="fas fa-bell header-icon"></i> */}
				<i className="fas fa-moon header-icon dark-mode-toggle"></i>
				<img src="/avatar.png" alt="Admin Avatar" className="admin-avatar" />
			</div>
			<motion.div
				initial={{
					translateX: 1500,
				}}
				onClick={() => {
					setOpened(false);
				}}
				className="fixed top-0 left-0 w-full h-screen bg-[#ECECEC] xl:hidden z-50 overflow-auto pt-5 px-5"
				animate={opened ? "open" : "close"}
				variants={{
					open: {
						translateX: 0,
					},
					close: {
						translateX: 1500,
					},
				}}
				transition={{
					duration: 0.2,
					delay: 0.1,
					type: "spring",
					stiffness: 200,
					damping: 15,
				}}>
				<div className="py-5">
					<i class="fa-solid fa-xmark text-4xl"></i>
				</div>
				<SidebarContent />
			</motion.div>
		</header>
	);
}
