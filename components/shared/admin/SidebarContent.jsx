"use client";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SidebarContent() {
	const pathname = usePathname();

	return (
		<>
			<div className="flex flex-col items-center justify-center">
				<Image
					src="/logo.png"
					alt="Rich Cafe Logo"
					className="logo"
					width={80}
					height={100}
					unoptimized
				/>
			</div>
			<nav className="sidebar-nav">
				<ul>
					<li>
						<Link
							href="/admin"
							className={`nav-item ${pathname === "/admin" ? "active" : ""}`}>
							<i className="fas fa-tachometer-alt icon"></i> Overview
						</Link>
					</li>
					<li>
						<Link
							href="/admin/menu"
							className={`nav-item ${
								pathname === "/admin/menu" ? "active" : ""
							}`}>
							<i className="fas fa-book icon"></i> Menu
						</Link>
					</li>
					<li>
						<Link
							href="/admin/orders"
							className={`nav-item ${
								pathname === "/admin/orders" ? "active" : ""
							}`}>
							<i className="fas fa-utensils icon"></i> Orders
						</Link>
					</li>
					<li>
						<Link
							href="/admin/customers"
							className={`nav-item ${
								pathname === "/admin/customers" ? "active" : ""
							}`}>
							<i className="fas fa-users icon"></i> Customers
						</Link>
					</li>
					{/* <li>
						<Link
							href="/admin/analysis"
							className={`nav-item ${
								pathname === "/admin/analysis" ? "active" : ""
							}`}>
							<i className="fas fa-chart-line icon"></i> Analysis
						</Link>
					</li> */}
					<li>
						<Link
							href="/admin/settings"
							className={`nav-item ${
								pathname === "/admin/settings" ? "active" : ""
							}`}>
							<i className="fas fa-cog icon"></i> Settings
						</Link>
					</li>
					<li>
						<a href="" className="nav-item logout-link" id="adminLogout">
							<i className="fas fa-sign-out-alt icon"></i> Logout
						</a>
					</li>
				</ul>
			</nav>
		</>
	);
}
