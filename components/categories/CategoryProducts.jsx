"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useRootStore } from "../shared/providers/RootProvider";
import React from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function CategoryProducts() {
	const params = useParams();
	const category = params.id;
	const { setState } = useRootStore();

	const [search, setSearch] = useState("");

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
	});

	const { data: categoryDetail, isFetching: categoryDetailLoading } = useQuery({
		queryKey: ["category-detail", category],
		queryFn: async () => {
			const request = await fetch(`/api/customer/category/${category}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response.category;
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
				<p className="user-dashboard-desc">
					Search For Your Craving And We Deliver
				</p>
				<div className="user-dashboard-search-bar">
					<input
						type="text"
						placeholder="Search Products..."
						className="user-dashboard-search-input"
						onChange={(e) => {
							setSearch(e.target.value);
						}}
					/>
					<button className="!bg-primary user-dashboard-search-btn !shrink-0 w-[] !rounded-full">
						<i className="fas fa-arrow-right"></i>
					</button>
				</div>
			</section>
			<section className="user-dashboard-available !py-5">
				<h2>{categoryDetail?.name || ""}</h2>
				<div className="user-dashboard-food-grid !grid-cols-2">
					{(productsLoading || !products) &&
						Array(6)
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
								<div className="">
									<div className="!flex-col !items-start">
										<h3 className="!text-3xl !line-clamp-2 font-semibold">
											{product.name}
										</h3>
										<span className="user-dashboard-food-price !text-[15px]">
											from ₦
											{product.sizes[0].discountPrice > 0
												? product.sizes[0].discountPrice.toLocaleString()
												: product.sizes[0].price.toLocaleString()}{" "}
											<span className="line-through text-red-500">
												{product.sizes[0].discountPrice > 0
													? product.sizes[0].price.toLocaleString()
													: ""}
											</span>
										</span>
									</div>
								</div>
							</Link>
						))}
				</div>
			</section>
		</div>
	);
}
