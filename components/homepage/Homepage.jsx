"use client";
import Image from "next/image";
import React from "react";

export default function Homepage() {
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
					/>
					<button className="user-dashboard-search-btn">
						<i className="fas fa-arrow-right"></i>
					</button>
				</div>
			</section>
			<section className="user-dashboard-categories">
				<div className="user-dashboard-category-item flex items-center justify-center w-max rounded-full bg-[#eaeaea] px-[6px] py-[6px]">
					<p className="!m-0 text-xl">Rice</p>
				</div>
				<div className="user-dashboard-category-item flex items-center justify-center w-max rounded-full bg-[#eaeaea] px-[6px] py-[6px]">
					<p className="!m-0 text-xl">Spage</p>
				</div>
				<div className="user-dashboard-category-item flex items-center justify-center w-max rounded-full bg-[#eaeaea] px-[6px] py-[6px]">
					<p className="!m-0 text-xl">Shawarma</p>
				</div>
				<div className="user-dashboard-category-item flex items-center justify-center w-max rounded-full bg-[#eaeaea] px-[6px] py-[6px]">
					<p className="!m-0 text-xl">Burgers</p>
				</div>
				<div className="user-dashboard-category-item flex items-center justify-center w-max rounded-full bg-[#eaeaea] px-[6px] py-[6px]">
					<p className="!m-0 text-xl">Milkshake</p>
				</div>
			</section>
			<section className="user-dashboard-available !py-0">
				<h2>Available Food</h2>
				<div className="user-dashboard-food-grid">
					<div className="user-dashboard-food-card-content">
						<div className="user-dashboard-food-img">
							<Image
								src={
									"https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6"
								}
								className="h-full w-full object-cover"
								width={400}
								height={200}
								alt="jsjs"
								unoptimized
							/>
						</div>
						<div className="user-dashboard-food-info">
							<div className="user-dashboard-food-details">
								<h3>Rice</h3>
								<span className="user-dashboard-food-price">5,000</span>
							</div>
							<p>Preparation Time | 2 min</p>
						</div>
					</div>
					<div className="user-dashboard-food-card-content">
						<div className="user-dashboard-food-img">
							<Image
								src={
									"https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6"
								}
								className="h-full w-full object-cover"
								width={400}
								height={200}
								alt="jsjs"
								unoptimized
							/>
						</div>
						<div className="user-dashboard-food-info">
							<div className="user-dashboard-food-details">
								<h3>Rice</h3>
								<span className="user-dashboard-food-price">5,000</span>
							</div>
							<p>Preparation Time | 2 min</p>
						</div>
					</div>
				</div>
			</section>

			<nav className="user-dashboard-bottom-nav">
				<a href="homepage.html" className="active">
					<i className="fas fa-home"></i>
					<span>Home</span>
				</a>
				<a href="partner.html">
					<i className="fas fa-handshake"></i>
					<span>Partner</span>
				</a>
				<a href="#">
					<i className="fas fa-receipt"></i>
					<span>Order</span>
				</a>
				<a href="support.html">
					<i className="fas fa-headset"></i>
					<span>Support</span>
				</a>
				<a href="profile.html">
					<i className="fas fa-user"></i>
					<span>Profile</span>
				</a>
			</nav>
		</div>
	);
}
