"use client";
import React from "react";

export default function AdminOverview() {
	return (
		<>
			<header className="dashboard-header">
				<div className="header-left">
					<button className="menu-toggle" id="menuToggle">
						<i className="fas fa-bars"></i>
					</button>
					<h1 className="page-title">Dashboard Overview</h1>
				</div>
				<div className="header-right">
					<div className="search-box">
						<input type="text" placeholder="Search..." />
						<i className="fas fa-search"></i>
					</div>
					<i className="fas fa-bell header-icon"></i>
					<i className="fas fa-moon header-icon dark-mode-toggle"></i>
					<img
						src="images/avatar.png"
						alt="Admin Avatar"
						className="admin-avatar"
					/>
				</div>
			</header>

			<section className="dashboard-section dashboard-overview-content">
				<div className="top-stat-cards-grid">
					<div className="dashboard-stat-card">
						<div className="stat-icon sales-icon">
							<i className="fas fa-book"></i>
						</div>
						<div className="stat-details">
							<p className="stat-label">Menu</p>
							<p className="stat-value" id="menuItemCount">
								0
							</p>
						</div>
					</div>

					<div className="dashboard-stat-card">
						<div className="stat-icon orders-icon">
							<i className="fas fa-utensils"></i>
						</div>
						<div className="stat-details">
							<p className="stat-label">Today's Orders</p>
							<p className="stat-value">--</p>
						</div>
					</div>

					<div className="dashboard-stat-card">
						<div className="stat-icon products-icon">
							<i className="fas fa-money-bill-wave"></i>
						</div>
						<div className="stat-details">
							<p className="stat-label">Today's Income</p>
							<p className="stat-value">₦ --</p>
						</div>
					</div>

					<div className="dashboard-stat-card">
						<div className="stat-icon customers-icon">
							<i className="fas fa-users"></i>
						</div>
						<div className="stat-details">
							<p className="stat-label">Customers</p>
							<p className="stat-value" id="totalCustomersCount">
								0
							</p>
						</div>
					</div>
				</div>

				<div className="overview-grid">
					<div className="sales-figures-card">
						<div className="card-header">
							<h3 className="card-title">Sales Figures</h3>
							<div className="dropdown">
								<select className="timeframe-select">
									<option value="daily">Daily</option>
									<option value="monthly">Monthly</option>
								</select>
							</div>
						</div>
						<div className="sales-chart-placeholder">
							<canvas id="salesBarChart"></canvas>
						</div>
					</div>

					<div className="orders-received-card">
						<div className="card-header">
							<h3 className="card-title">Number Of Received Orders</h3>
							<div className="dropdown">
								<select id="orderTimeframeSelect">
									<option value="today">Today</option>
									<option value="week">This Week</option>
									<option value="month">This Month</option>
								</select>
							</div>
						</div>
						<div className="order-status-content">
							<div className="donut-chart-container">
								<div className="donut-chart-outer">
									<canvas id="ordersDonutChart"></canvas>
									<div className="donut-chart-inner">
										<p className="chart-label" id="donutTimeframeLabel">
											Today
										</p>
										<p className="chart-value" id="donutOrderCount">
											7
										</p>
										<p className="chart-sub-label" id="donutSubLabel">
											Orders
										</p>
									</div>
								</div>
							</div>
							<div className="order-breakdown">
								<div className="breakdown-item">
									<span className="color-dot rice-orders"></span> Rice (
									<span id="riceOrders">100</span>
									Orders)
								</div>
								<div className="breakdown-item">
									<span className="color-dot burger-orders"></span> Burger (
									<span id="burgerOrders">70</span>
									Orders)
								</div>
								<div className="breakdown-item">
									<span className="color-dot milkshake-orders"></span> Milkshake
									(<span id="milkshakeOrders">50</span> Orders)
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="dashboard-section order-list-section">
					<div className="section-title">
						Order List
						<div className="order-status-filters">
							<button
								className="small-button status-pending"
								id="filterPending">
								Pending
							</button>
							<button
								className="small-button status-completed"
								id="filterCompleted">
								Completed
							</button>
						</div>
					</div>

					<div className="table-container">
						<table>
							<thead>
								<tr>
									<th>No</th>
									<th>ID</th>
									<th>Food Descriptions</th>
									<th>Location</th>
									<th>Hostel Name / No</th>
									<th>Phone No</th>
									<th>Quantity</th>
									<th>Amount</th>
									<th>Order Status</th>
								</tr>
							</thead>
							<tbody id="orderTableBody"></tbody>
						</table>
					</div>
				</div>
			</section>
		</>
	);
}
