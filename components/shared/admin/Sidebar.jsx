"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarContent from "./SidebarContent";

export default function Sidebar() {
	const pathname = usePathname();

	return (
		<aside className="sidebar">
			<SidebarContent />
		</aside>
	);
}
