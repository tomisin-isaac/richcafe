"use client";
import Image from "next/image";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useRootStore } from "../shared/providers/RootProvider";

export default function Homepage() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("");
	const { setState } = useRootStore();

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

	useQuery({
		queryKey: ["me"],
		queryFn: async () => {
			const request = await fetch(`/api/auth/me`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response.user;
		},
		gcTime: 0,
	});

	const { data: products, isFetching: productsLoading } = useQuery({
		queryKey: ["products", search, category],
		queryFn: async () => {
			const request = await fetch(
				`/api/customer/products?q=${search}&category=${category}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response.products;
		},
		gcTime: 0,
		enabled: categories !== undefined,
	});

	return (
		<div className="user-dashboard-container">
			<section className="user-dashboard-hero">
				<p className="user-dashboard-subtitle">
					Order Our Restaurant food, takeaway and Pizza.
				</p>
				<h1 className="user-dashboard-title text-white">
					Feast Your Senses, <span>Fast and Fresh</span>
				</h1>
				<p className="user-dashboard-desc">
					Search For Your Craving And We Deliver
				</p>
				<div className="user-dashboard-search-bar">
					<input
						type="text"
						placeholder="Food..."
						className="user-dashboard-search-input"
						onChange={(e) => {
							setSearch(e.target.value);
						}}
					/>
					<button className="user-dashboard-search-btn !shrink-0 w-[] !rounded-full">
						<i className="fas fa-arrow-right"></i>
					</button>
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
					<div className="user-dashboard-category-item flex flex-col items-center shrink-0">
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
								category === "" ? "!border-[#28a745] border-[3px]" : ""
							} w-[60px] h-[60px] rounded-full object-cover cursor-pointer`}
						/>
						<p className="text-xl shrink-0">All Categories</p>
					</div>
					{!categoriesLoading &&
						categories &&
						categories.map((c) => (
							<div
								key={c._id}
								className={`user-dashboard-category-item flex flex-col items-center shrink-0 `}>
								<Image
									src={c.image}
									width={60}
									height={60}
									alt=""
									onClick={() => {
										setCategory(c._id);
									}}
									className={`w-[60px] h-[60px] rounded-full object-cover cursor-pointer ${
										category === c._id ? "!border-[#28a745] border-[3px]" : ""
									}`}
								/>
								<p className="text-xl">{c.name}</p>
							</div>
						))}
				</section>
			)}
			<section className="user-dashboard-available !py-0">
				<h2>Available Food</h2>
				<div className="user-dashboard-food-grid">
					{(productsLoading || !products) &&
						Array(5)
							.fill("")
							.map((d, i) => (
								<div
									key={i}
									className="w-full h-[200px] bg-[#d3d3d3] animate-pulse rounded-lg"></div>
							))}
					{!productsLoading &&
						products &&
						products.map((product, i) => (
							<Link
								onClick={() => setState({ currentProduct: product })}
								href={`/product-details?p=${product._id}`}
								key={i}
								className="group relative block rounded-2xl bg-white border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
								<div className="relative h-40 overflow-hidden">
									<Image
										src={product.images[0]}
										className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
										width={400}
										height={200}
										alt={product.name}
										unoptimized
									/>
								</div>

								<div className="relative px-4 pt-6 pb-4">
									{/* time chip, straddling the image/content seam like a ticket stub */}
									<div className="absolute -top-4 left-4 flex items-center gap-1 bg-white border border-stone-200 shadow-sm rounded-full px-2.5 py-1">
										{/* <Clock
											className="h-3 w-3 text-indigo-800"
											strokeWidth={2.5}
										/> */}
										<span className="text-xs font-semibold text-indigo-950">
											{product.preparationTimeMinutes} min
										</span>
									</div>

									<h3 className="font-semibold text-stone-900 leading-snug line-clamp-2 h-11">
										{product.name}
									</h3>

									<div className="mt-3 flex items-end justify-between">
										<div>
											<div className="text-xs uppercase tracking-wide text-stone-400 font-medium">
												Price
											</div>
											<div className="text-lg font-bold text-amber-700">
												{product.sizes?.[0]?.price != null
													? `₦${product.sizes[0].price.toLocaleString()}`
													: "Price unavailable"}
											</div>
										</div>
										<div className="flex items-center gap-1 text-xs font-medium text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
											View {/* View <ArrowUpRight className="h-3.5 w-3.5" /> */}
										</div>
									</div>
								</div>
							</Link>
						))}
				</div>
			</section>
		</div>
	);
}
