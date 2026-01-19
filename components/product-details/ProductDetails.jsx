"use client";
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRootStore } from "../shared/providers/RootProvider";
import Image from "next/image";
import Link from "next/link";
import AddToCart from "./AddToCart";
import CartActions from "./CartActions";

export default function ProductDetails() {
	const seachparams = useSearchParams();
	const productId = seachparams.get("p");
	const { currentProduct, setState, cart } = useRootStore();
	const queryClient = useQueryClient();

	const { data, isLoading, error } = useQuery({
		queryKey: ["product-details", productId],
		queryFn: async () => {
			const request = await fetch(`/api/customer/products/${productId}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response.product;
		},
		enabled: currentProduct === null,
	});

	useEffect(() => {
		if (data) {
			setState({ currentProduct: data });
		}
	}, [data]);

	const findCartLine = (cart, productId, sizeId) =>
		cart.items.find(
			(it) =>
				String(it.product) === String(productId) &&
				String(it.sizeId) === String(sizeId)
		);

	//console.log(currentProduct, "product details");

	return (
		<div className="product-container">
			{isLoading && !currentProduct && (
				<div className="h-screen flex text-2xl font-medium items-center justify-center">
					<span className="animate-bounce">Loading product...</span>
				</div>
			)}
			{!isLoading && error && (
				<div className="h-screen flex text-2xl font-medium items-center justify-center">
					<span className="">Product not found.</span>
				</div>
			)}
			{!isLoading && currentProduct && (
				<>
					<header className="product-header">
						<Link
							href={"/"}
							className="product-back-btn"
							id="productBackBtn"
							aria-label="Go back">
							<i className="fas fa-arrow-left"></i>
						</Link>
						<h1 className="product-title !m-0 !p-0" id="productCategoryTitle">
							{currentProduct.category.name}
						</h1>
					</header>

					<section className="product-meta">
						<div className="product-meta-item">
							<p className="product-meta-label">Preparation Time</p>
							<p className="product-meta-value" id="productPrepTime">
								{currentProduct.preparationTimeMinutes} mins
							</p>
						</div>
						<div className="product-meta-item">
							<p className="product-meta-label">Available Delivery Type</p>
							<p className="product-meta-value">Instant Delivery</p>
						</div>
					</section>

					<section className="product-selected" id="productSelected">
						<div className="product-item-left">
							<div className="h-[200px] !w-full rounded-lg overflow-hidden">
								<Image
									src={currentProduct.images[0]}
									height={200}
									width={350}
									alt="richcafe"
									priority
									unoptimized
									className="h-full w-full object-cover"
								/>
							</div>
							<div>
								<h3 className="product-item-title">{currentProduct.name}</h3>
								<div className="product-item-subtitle">
									<span className="product-stock">
										{currentProduct.isAvailable ? "Available" : "Unavailable"}
									</span>
								</div>
							</div>
							{currentProduct.sizes.map((s, i) => {
								const isInCart = findCartLine(cart, currentProduct._id, s._id);
								return (
									<div key={i} className="product-size-row">
										<div className="product-size-pill flex flex-col">
											{s.name}
											<span className="font-semibold">
												₦{s.price.toLocaleString()}
											</span>
										</div>
										{!isInCart && (
											<AddToCart
												productId={currentProduct._id}
												sizeId={s._id}
											/>
										)}
										{isInCart && (
											<CartActions
												itemId={isInCart._id}
												quantity={isInCart.quantity}
											/>
										)}
									</div>
								);
							})}
						</div>
					</section>

					{currentProduct.addonGroups.map((g, i) => (
						<section key={i} className="product-related ">
							<h2 className="product-related-title !m-0 p-0!">{g.name}</h2>
							<div
								className="product-related-list !px-[10px] !m-0"
								id="productRelatedList">
								{g.items.map((s, i) => {
									return (
										<div
											key={i}
											className="flex flex-col mb-5 pb-6 border-b border-b-[#eaeaea]">
											<div className="flex items-center gap-4 mb-3">
												<Image
													src={s.product.images[0]}
													height={200}
													width={350}
													alt="richcafe"
													priority
													unoptimized
													className="w-[50px] h-[50px] object-cover rounded-lg"
												/>
												<h2 className="text-3xl font-medium !m-0 p-0!">
													{s.product.name}
												</h2>
											</div>
											{s.product.sizes.map((size, idx) => {
												const isInCart = findCartLine(
													cart,
													s.product._id,
													size._id
												);
												return (
													<div key={idx} className="product-size-row">
														<div className="product-size-pill flex flex-col">
															{size.name}
															<span className="font-semibold">
																₦{size.price.toLocaleString()}
															</span>
														</div>
														{!isInCart && (
															<AddToCart
																productId={s.product._id}
																sizeId={size._id}
															/>
														)}
														{isInCart && (
															<CartActions
																itemId={isInCart._id}
																quantity={isInCart.quantity}
															/>
														)}
													</div>
												);
											})}
										</div>
									);
								})}
							</div>
						</section>
					))}
				</>
			)}
		</div>
	);
}
