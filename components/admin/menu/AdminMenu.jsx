"use client";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AddCategoryModal from "./AddCategoryModal";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import AddProductModal from "./AddProductModal";
import ConfirmDelete from "./ConfirmDelete";

export default function AdminMenu() {
	const [createCategory, setCreateCategory] = useState(false);
	const [editCategory, setEditCategory] = useState(false);
	const [deleteCategory, setDeleteCategory] = useState(false);
	const [createProduct, setCreateProduct] = useState(false);
	const [editProduct, setEditProduct] = useState(null);
	const [deleteProduct, setDeleteProduct] = useState(null);
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState("");

	const { data: categories, isFetching: categoriesLoading } = useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const request = await fetch(`/api/admin/category`, {
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

	//console.log(products);

	return (
		<>
			<AnimatePresence>
				{createCategory && (
					<motion.div
						className="w-max h-max"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<AddCategoryModal close={() => setCreateCategory(false)} />
					</motion.div>
				)}
				{editCategory && (
					<motion.div
						className="w-max h-max"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<AddCategoryModal
							editCategory={editCategory}
							close={() => setEditCategory(null)}
						/>
					</motion.div>
				)}
				{deleteCategory && (
					<motion.div
						className="w-max h-max"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<ConfirmDelete
							id={deleteCategory._id}
							mode={"category"}
							close={() => setDeleteCategory(null)}
						/>
					</motion.div>
				)}

				{createProduct && (
					<motion.div
						className="w-max h-max"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<AddProductModal close={() => setCreateProduct(false)} />
					</motion.div>
				)}
				{editProduct && (
					<motion.div
						className="w-max h-max"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<AddProductModal
							editProduct={editProduct}
							close={() => setEditProduct(null)}
						/>
					</motion.div>
				)}
				{deleteProduct && (
					<motion.div
						className="w-max h-max"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}>
						<ConfirmDelete
							id={deleteProduct._id}
							mode={"product"}
							close={() => setDeleteProduct(null)}
						/>
					</motion.div>
				)}
			</AnimatePresence>
			<header className="dashboard-header">
				<div className="header-left">
					<button className="menu-toggle" id="menuToggle">
						<i className="fas fa-bars"></i>
					</button>
					<h1 className="page-title">Menu Management</h1>
				</div>
				<div className="header-right">
					{/* <i className="fas fa-bell header-icon"></i> */}
					<i className="fas fa-moon header-icon dark-mode-toggle"></i>
					<img src="/avatar.png" alt="Admin Avatar" className="admin-avatar" />
				</div>
			</header>

			<section className="menu-management-content">
				<div className="section-header">
					<h2 className="section-title">Categories</h2>
					<button
						onClick={() => {
							setCreateCategory(true);
						}}
						className="add-button"
						id="addCategoryBtn">
						<i className="fas fa-plus"></i> Add Category
					</button>
				</div>
				<div className="category-list">
					<div
						onClick={() => {
							setCategory("");
						}}
						className={`category-card ${
							category === "" ? "!bg-green-300" : ""
						}`}>
						<div className="category-info">
							<h3 className="category-name">All Categories</h3>
							<p className="category-items-count">2 Items</p>
						</div>
					</div>
					{categoriesLoading &&
						Array(5)
							.fill("")
							.map((d, i) => (
								<div
									key={i}
									className="w-[150px] h-[200px] bg-[#d3d3d3] animate-pulse rounded-lg"></div>
							))}
					{!categoriesLoading &&
						categories &&
						categories.map((c) => (
							<div
								key={c._id}
								className={`category-card ${
									c._id === category ? "!bg-green-300" : ""
								}`}>
								<Image
									src={c.image}
									width={60}
									height={60}
									alt=""
									className="category-image"
									onClick={() => {
										setCategory(c._id);
									}}
								/>
								<div className="category-info">
									<h3 className="category-name">{c.name}</h3>
									<p className="category-items-count">2 Items</p>
								</div>
								<div className="category-actions gap-5 flex items-center">
									<i
										onClick={() => {
											setEditCategory(c);
										}}
										className="fas fa-edit edit-icon text-2xl"></i>
									<i
										onClick={() => {
											setDeleteCategory(c);
										}}
										className="fas fa-trash-alt delete-icon text-2xl"></i>
								</div>
							</div>
						))}
				</div>

				<div className="section-header !py-5 !border-t !border-b !border-t-[#eaeaea] !border-b-[#eaeaea] mb-5">
					<h2 className="section-title !m-0" id="itemListTitle">
						All Items List
					</h2>
					<div className="flex items-center gap-5">
						<div className="search-box">
							<input
								onChange={(e) => {
									setSearch(e.target.value);
								}}
								value={search}
								type="text"
								placeholder="Search..."
							/>
							<i className="fas fa-search"></i>
						</div>
						<button
							onClick={() => {
								setCreateProduct(true);
							}}
							className="add-button"
							id="addItemBtn">
							<i className="fas fa-plus"></i> Add Item
						</button>
					</div>
				</div>
				<div className="table-responsive">
					<table className="menu-items-table">
						<thead>
							<tr>
								<th>No</th>
								<th>Name</th>
								<th>Category</th>
								<th>Sizes & Prices</th>
								<th>Preparation time</th>
								<th>Uploaded Image</th>
								<th>Availability</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{productsLoading &&
								Array(5)
									.fill("")
									.map((d, i) => (
										<tr key={i}>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
											</td>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
											</td>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
											</td>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
											</td>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
											</td>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
											</td>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
											</td>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[80px] h-[5px] rounded-full"></span>
											</td>
										</tr>
									))}
							{!productsLoading &&
								products &&
								products.map((product, index) => (
									<tr key={index}>
										<td>{index + 1}</td>
										<td>{product.name}</td>
										<td>{product.category.name}</td>
										<td>
											<div className="flex flex-col">
												{product.sizes.map((s, i) => {
													return (
														<span key={i} className="item-size-display">
															{s.name}: ₦{s.price.toLocaleString()}
														</span>
													);
												})}
											</div>
										</td>
										<td>{product.preparationTimeMinutes} mins</td>
										<td>
											<Image
												src={product.images[0]}
												width={50}
												height={50}
												alt="richcafe"
												className="w-[50px] h-[50px] object-cover"
											/>
										</td>
										<td>
											{product.isAvailable ? "Available" : "Not Available"}
										</td>
										<td>
											<div className="flex items-center gap-5">
												<i
													onClick={() => {
														setEditProduct(product);
													}}
													className="fas fa-edit edit-item-icon text-2xl"></i>
												<i
													onClick={() => {
														setDeleteProduct(product);
													}}
													className="fas fa-trash-alt delete-item-icon text-2xl"></i>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</section>
		</>
	);
}
