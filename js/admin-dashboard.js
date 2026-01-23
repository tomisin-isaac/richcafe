document.addEventListener("DOMContentLoaded", function () {
	// --- Sidebar Toggle for Mobile ---
	const menuToggle = document.getElementById("menuToggle");
	const sidebar = document.querySelector(".sidebar");
	const mainContent = document.querySelector(".main-content");

	if (menuToggle && sidebar && mainContent) {
		menuToggle.addEventListener("click", function () {
			sidebar.classList.toggle("hidden");
			mainContent.classList.toggle("sidebar-hidden");
		});
	}

	// --- Dark Mode Toggle ---
	const darkModeToggle = document.querySelector(".dark-mode-toggle");
	if (darkModeToggle) {
		darkModeToggle.addEventListener("click", function () {
			document.body.classList.toggle("dark-mode");
			// Save preference to localStorage
			if (document.body.classList.contains("dark-mode")) {
				localStorage.setItem("theme", "dark");
				darkModeToggle.classList.replace("fa-moon", "fa-sun");
			} else {
				localStorage.setItem("theme", "light");
				darkModeToggle.classList.replace("fa-sun", "fa-moon");
			}
			// Re-render charts to pick up new CSS variable colors
			updateSalesChart();
			updateOrdersDonutChart();
		});

		// Apply saved theme on load
		if (localStorage.getItem("theme") === "dark") {
			document.body.classList.add("dark-mode");
			darkModeToggle.classList.replace("fa-moon", "fa-sun");
		} else {
			document.body.classList.remove("dark-mode"); // Ensure light mode is default if no preference
			darkModeToggle.classList.replace("fa-sun", "fa-moon");
		}
	}

	// --- Sales Figures Bar Chart ---
	const salesCtx = document.getElementById("salesBarChart");
	let salesChart;

	if (salesCtx) {
		const salesTimeframeSelect = document.querySelector(
			".sales-figures-card .timeframe-select"
		);

		// Function to generate dummy data for sales chart based on timeframe
		function getSalesData(timeframe) {
			// Max possible sales for the year/week, for the grey background part of the bar
			const monthlyMax = 620000; // Based on your design's Y-axis max
			const dailyMax = 450000; // Example max for daily

			if (timeframe === "daily") {
				return {
					labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
					actualData: [150000, 220000, 180000, 300000, 250000, 400000, 350000],
					maxData: dailyMax,
					labelFormat: "Daily Sales",
				};
			} else {
				// 'monthly'
				return {
					labels: [
						"Jan",
						"Feb",
						"Mar",
						"Apr",
						"May",
						"Jun",
						"Jul",
						"Aug",
						"Sep",
						"Oct",
						"Nov",
						"Dec",
					],
					actualData: [
						300000, 210000, 280000, 440000, 120000, 600000, 380000, 210000,
						50000, 350000, 510000, 620000,
					],
					maxData: monthlyMax,
					labelFormat: "Monthly Sales",
				};
			}
		}

		// Function to create or update the sales chart
		function updateSalesChart() {
			const selectedTimeframe = salesTimeframeSelect.value;
			const { labels, actualData, maxData, labelFormat } =
				getSalesData(selectedTimeframe);

			if (salesChart) {
				salesChart.destroy();
			}

			// Get CSS variables for colors
			const style = getComputedStyle(document.body);
			const greenAccent = style.getPropertyValue("--green-accent").trim();
			const chartBarLight = style.getPropertyValue("--chart-bar-light").trim(); // Light grey
			const textLight = style.getPropertyValue("--text-light").trim();
			const borderColor = style.getPropertyValue("--border-color").trim();

			salesChart = new Chart(salesCtx, {
				type: "bar",
				data: {
					labels: labels,
					datasets: [
						{
							label: labelFormat,
							data: actualData,
							backgroundColor: greenAccent, // Green for actual sales
							borderColor: "transparent",
							borderWidth: 1,
							borderRadius: 5,
							barPercentage: 0.7,
							categoryPercentage: 0.8,
							stack: "salesStack", // Group bars for stacking
						},
						{
							label: "Remaining Capacity", // This dataset fills the rest of the bar
							data: actualData.map((val) => maxData - val), // Calculate remaining
							backgroundColor: chartBarLight, // Light grey
							borderColor: "transparent",
							borderWidth: 1,
							borderRadius: 5,
							barPercentage: 0.7,
							categoryPercentage: 0.8,
							stack: "salesStack", // Group bars for stacking
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							display: false,
						},
						tooltip: {
							mode: "index", // Show tooltip for all datasets at a point
							intersect: false, // Tooltip shows if cursor is anywhere on the x-axis
							callbacks: {
								label: function (context) {
									if (context.datasetIndex === 0) {
										// Only show label for the actual sales data
										let label = context.dataset.label || "";
										if (label) {
											label += ": ";
										}
										if (context.parsed.y !== null) {
											label += "₦" + context.parsed.y.toLocaleString();
										}
										return label;
									}
									return null; // Hide tooltip for the 'remaining' dataset
								},
							},
						},
					},
					scales: {
						y: {
							beginAtZero: true,
							max: maxData, // Set max based on the dummy data's max
							stacked: true, // Crucial for stacking bars
							ticks: {
								callback: function (value) {
									if (value >= 1000000) {
										return "₦" + value / 1000000 + "M";
									} else if (value >= 1000) {
										return "₦" + value / 1000 + "k";
									}
									return "₦" + value;
								},
								color: textLight,
							},
							grid: {
								color: borderColor,
								drawBorder: false,
							},
						},
						x: {
							stacked: true, // Crucial for stacking bars
							ticks: {
								color: textLight,
							},
							grid: {
								display: false,
								drawBorder: false,
							},
						},
					},
				},
			});
		}

		// Initial chart render
		updateSalesChart();

		// Update chart on dropdown change
		salesTimeframeSelect.addEventListener("change", updateSalesChart);
	}

	// --- Orders Received Donut Chart ---
	const ordersCtx = document.getElementById("ordersDonutChart");
	let ordersDonutChart;

	if (ordersCtx) {
		const orderTimeframeSelect = document.getElementById(
			"orderTimeframeSelect"
		);
		const donutTimeframeLabel = document.getElementById("donutTimeframeLabel");
		const donutOrderCount = document.getElementById("donutOrderCount");
		const donutSubLabel = document.getElementById("donutSubLabel");
		const riceOrdersSpan = document.getElementById("riceOrders");
		const burgerOrdersSpan = document.getElementById("burgerOrders");
		const milkshakeOrdersSpan = document.getElementById("milkshakeOrders");

		// Function to generate dummy data for donut chart based on timeframe
		function getOrdersData(timeframe) {
			let totalOrders;
			let rice, burger, milkshake;
			let labelText;

			if (timeframe === "today") {
				totalOrders = 7;
				rice = 3;
				burger = 2;
				milkshake = 2;
				labelText = "Today";
			} else if (timeframe === "week") {
				totalOrders = 85;
				rice = 30;
				burger = 25;
				milkshake = 30;
				labelText = "This Week";
			} else {
				// 'month'
				totalOrders = 320;
				rice = 120;
				burger = 100;
				milkshake = 100;
				labelText = "This Month";
			}

			return {
				total: totalOrders,
				breakdown: [rice, burger, milkshake],
				labels: ["Rice", "Burger", "Milkshake"],
				labelText: labelText,
			};
		}

		// Function to create or update the donut chart
		function updateOrdersDonutChart() {
			const selectedTimeframe = orderTimeframeSelect.value;
			const { total, breakdown, labels, labelText } =
				getOrdersData(selectedTimeframe);

			// Update center text and breakdown list
			donutTimeframeLabel.textContent = labelText;
			donutOrderCount.textContent = total;
			donutSubLabel.textContent = "Orders"; // Always 'Orders' for this context, consistent with the image

			// Update breakdown numbers
			riceOrdersSpan.textContent = breakdown[0];
			burgerOrdersSpan.textContent = breakdown[1];
			milkshakeOrdersSpan.textContent = breakdown[2];

			if (ordersDonutChart) {
				ordersDonutChart.destroy();
			}

			// Get CSS variables for colors, directly mapping to your design
			const style = getComputedStyle(document.body);
			const greenAccent = style.getPropertyValue("--green-accent").trim(); // Rice
			const donutSegmentLightPink = style
				.getPropertyValue("--donut-segment-light-pink")
				.trim(); // Burger
			const donutSegmentDarkBlue = style
				.getPropertyValue("--donut-segment-dark-blue")
				.trim(); // Milkshake
			const cardBackground = style
				.getPropertyValue("--card-background-light")
				.trim(); // Border color for donut

			ordersDonutChart = new Chart(ordersCtx, {
				type: "doughnut",
				data: {
					labels: labels,
					datasets: [
						{
							data: breakdown,
							backgroundColor: [
								greenAccent, // Rice
								donutSegmentLightPink, // Burger
								donutSegmentDarkBlue, // Milkshake
							],
							borderColor: cardBackground, // Border matches card background for seamless look
							borderWidth: 2,
							hoverOffset: 10,
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					cutout: "80%", // Donut thickness
					plugins: {
						legend: {
							display: false,
						},
						tooltip: {
							callbacks: {
								label: function (context) {
									let label = context.label || "";
									if (label) {
										label += ": ";
									}
									if (context.parsed !== null) {
										label += context.parsed + " orders";
									}
									return label;
								},
							},
						},
					},
					// No explicit animation hook needed here for color changes,
					// as Chart.js handles it when the chart is re-instantiated.
				},
			});
		}

		// Initial chart render
		updateOrdersDonutChart();

		// Update chart on dropdown change
		orderTimeframeSelect.addEventListener("change", updateOrdersDonutChart);
	}
});

// Menu count list
// Add this to admin-dashboard.js
document.addEventListener("DOMContentLoaded", function () {
	// ... existing code ...

	// --- Update Menu Item Count on Overview Page ---
	function updateMenuItemCount() {
		const totalMenuItemsElement = document.getElementById("menuItemCount"); // Assuming this ID exists in admin-overview.html
		if (totalMenuItemsElement) {
			// Function to load menu item data from localStorage, adapted from admin-menu.js
			function loadMenuItemsFromLocalStorage() {
				const menuItemsJson = localStorage.getItem("menuItems");
				return menuItemsJson ? JSON.parse(menuItemsJson) : [];
			}

			const menuItems = loadMenuItemsFromLocalStorage();
			totalMenuItemsElement.textContent = menuItems.length;
			console.log(
				`admin-dashboard.js: Updated menu item count to ${menuItems.length}`
			);
		} else {
			console.log(
				"admin-dashboard.js: Element with ID 'menuItemCount' not found on this page."
			);
		}
	}

	// Call the function to update the menu item count when the DOM is loaded
	// This will run on admin-overview.html because it includes admin-dashboard.js
	updateMenuItemCount();
});

// Customer Count List
document.addEventListener("DOMContentLoaded", () => {
	// Function to load customer data from localStorage
	function loadCustomersFromLocalStorage() {
		const customersJson = localStorage.getItem("customers");
		return customersJson ? JSON.parse(customersJson) : [];
	}

	// Get the element where the total customer count will be displayed
	const totalCustomersCountElement = document.getElementById(
		"totalCustomersCount"
	);

	if (totalCustomersCountElement) {
		const customers = loadCustomersFromLocalStorage();
		totalCustomersCountElement.textContent = customers.length;
		console.log(`Updated customer count on overview page: ${customers.length}`);
	} else {
		console.error(
			"Element with ID 'totalCustomersCount' not found in admin-overview.html."
		);
	}
});
