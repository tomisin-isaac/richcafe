"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Pagination from "../../shared/Pagination";

export default function CustomersPage() {
	const [currentPage, setCurrentPage] = useState(1);
	const [search, setSearch] = useState("");

	const { data: customers, isFetching: customersLoading } = useQuery({
		queryKey: ["customers", search],
		queryFn: async () => {
			const request = await fetch(`/api/admin/customers?search=${search}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			const response = await request.json();

			if (!request.ok) {
				throw new Error(response.error);
			}

			return response;
		},
		gcTime: 0,
	});

	return (
		<>
			<header class="dashboard-header">
				<div class="header-left">
					<button class="menu-toggle" id="menuToggle">
						<i class="fas fa-bars"></i>
					</button>
					<h1 class="page-title">Customer List</h1>
				</div>
				<div class="header-right">
					{/* <div class="search-box">
						<input type="text" placeholder="Search..." />
						<i class="fas fa-search"></i>
					</div> */}
					{/* <i class="fas fa-bell header-icon"></i> */}
					<i class="fas fa-moon header-icon dark-mode-toggle"></i>
					<img src="/avatar.png" alt="Admin Avatar" class="admin-avatar" />
				</div>
			</header>

			<section class="customers-management-content">
				<div class="section-header">
					<h2 class="section-title">Customers</h2>
					<div className="border border-[#eaeaea] !h-[40px] !p-2 rounded-lg">
						<i className="fas fa-search"></i>
						<input
							className="!h-full !text-2xl outline-none grow max-w-[90%] !p-0 !px-2"
							type="text"
							value={search}
							placeholder="Search customers..."
							id="ordersSearchInput"
							onChange={(e) => {
								setSearch(e.target.value);
							}}
						/>
					</div>
				</div>

				<div class="table-responsive">
					<table class="customers-table">
						<thead>
							<tr>
								<th>No</th>
								<th>Full Name</th>
								<th>Email Address</th>
								<th>Phone Number</th>
								{/* <th>Action</th> */}
							</tr>
						</thead>
						<tbody>
							{customersLoading &&
								Array(5)
									.fill("")
									.map((d, i) => (
										<tr key={i}>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
											</td>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
											</td>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
											</td>
											<td className="py-5">
												<span className="animate-pulse flex bg-[#d3d3d3] w-[50px] h-[5px] rounded-full"></span>
											</td>
										</tr>
									))}

							{!customersLoading &&
								customers &&
								customers.users.map((user, index) => (
									<tr key={index} className="text-2xl">
										<td>{index + 1}</td>
										<td>{user.name}</td>
										<td>{user.email}</td>
										<td>{user.phone}</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
				{customers && (
					<div className="mt-5">
						<Pagination
							totalPages={customers.totalPages}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					</div>
				)}
			</section>
		</>
	);
}
