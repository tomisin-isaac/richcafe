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
				`/api/admin/products?q=${search}&category=${category}`,
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
				{categoriesLoading &&
					Array(5)
						.fill("")
						.map((d, i) => (
							<div
								key={i}
								className="w-[60px] h-[60px] bg-[#d3d3d3] animate-pulse rounded-full"></div>
						))}
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
			<section className="user-dashboard-available !py-0">
				<h2>Available Food</h2>
				<div className="user-dashboard-food-grid">
					{(productsLoading || !products) &&
						Array(5)
							.fill("")
							.map((d, i) => (
								<div
									key={i}
									className="h-[200px] bg-[#d3d3d3] animate-pulse rounded-lg"></div>
							))}
					{!productsLoading &&
						products &&
						products.map((product, i) => (
							<Link
								onClick={() => {
									setState({ currentProduct: product });
								}}
								href={`/product-details?p=${product._id}`}
								key={i}
								className="user-dashboard-food-card-content">
								<div className="user-dashboard-food-img">
									<Image
										src={product.images[0]}
										className="h-full w-full object-cover"
										width={400}
										height={200}
										alt="jsjs"
										unoptimized
									/>
								</div>
								<div className="user-dashboard-food-info">
									<div className="user-dashboard-food-details">
										<h3>{product.name}</h3>
										<span className="user-dashboard-food-price">
											from ₦{product.sizes[0].price.toLocaleString()}
										</span>
									</div>
									<p>Preparation Time | {product.preparationTimeMinutes} min</p>
								</div>
							</Link>
						))}
				</div>
			</section>
		</div>
	);
}
