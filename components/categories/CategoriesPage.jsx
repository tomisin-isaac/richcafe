"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useRootStore } from "../shared/providers/RootProvider";
import React from "react";
import Image from "next/image";

export default function CategoriesPage() {
	const [category, setCategory] = useState("");

	const { data: categories, isFetching: categoriesLoading } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const request = await fetch(`/api/customer/category`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response.categories;
		},
		gcTime: 0,
	});

	return (
		<div className="product-container !w-full">
			<section className="user-dashboard-hero">
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
			</section>
			{categoriesLoading && (
				<section className="user-dashboard-categories !w-full !overflow-auto">
					{Array(5)
						.fill("")
						.map((d, i) => (
							<div
								key={i}
								className="shrink-0 w-[60px] h-[60px] bg-[#d3d3d3] animate-pulse rounded-full"></div>
						))}
				</section>
			)}
			{!categoriesLoading && categories && (
				<section className="user-dashboard-categories !w-full !overflow-auto">
					{/* <div className="user-dashboard-category-item flex flex-col items-center shrink-0">
						<Image
							src={"/all.jpg"}
							width={60}
							height={60}
							alt=""
							onClick={() => {
								setCategory("");
							}}
							unoptimized
							className={`${
								category === "" ? "!border-primary border-[3px]" : ""
							} w-[60px] h-[60px] rounded-full object-cover cursor-pointer`}
						/>
						<p className="text-xl shrink-0">All Categories</p>
					</div> */}
					{!categoriesLoading &&
						categories &&
						categories.map((c) => (
							<Link
								href={`/categories/${c._id}`}
								key={c._id}
								className={`user-dashboard-category-item flex flex-col items-center shrink-0 `}>
								<Image
									src={c.image}
									width={60}
									height={60}
									alt=""
									// onClick={() => {
									// 	setCategory(c._id);
									// }}
									className={`w-[60px] h-[60px] rounded-full object-cover cursor-pointer ${
										category === c._id ? "!border-primary border-[3px]" : ""
									}`}
								/>
								<p className="text-xl">{c.name}</p>
							</Link>
						))}
				</section>
			)}
		</div>
	);
}
