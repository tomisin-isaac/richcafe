document.addEventListener("DOMContentLoaded", () => {
	console.log("admin-settings.js: Script started.");

	// --- Operational Hours Logic ---
	const operationalStatusIndicator = document.getElementById(
		"operationalStatusIndicator"
	);
	const operationalStatusText = document.getElementById(
		"operationalStatusText"
	);
	const toggleOperationalHoursBtn = document.getElementById(
		"toggleOperationalHours"
	);

	const OPERATIONAL_STATUS_KEY = "operationalStatus"; // Key for localStorage

	// Function to load operational status from localStorage
	function loadOperationalStatus() {
		const status = localStorage.getItem(OPERATIONAL_STATUS_KEY);
		// Default to 'open' if no status is found
		return status === "closed" ? "closed" : "open";
	}

	// Function to save operational status to localStorage
	function saveOperationalStatus(status) {
		localStorage.setItem(OPERATIONAL_STATUS_KEY, status);
	}

	// Function to update the UI based on the operational status
	function updateOperationalStatusUI(status) {
		if (!operationalStatusIndicator || !operationalStatusText) {
			console.error(
				"admin-settings.js: Operational status UI elements not found."
			);
			return;
		}
		if (status === "open") {
			operationalStatusIndicator.style.backgroundColor = "#28a745"; // Green
			operationalStatusText.textContent = "Open For Business";
		} else {
			operationalStatusIndicator.style.backgroundColor = "#dc3545"; // Red
			operationalStatusText.textContent = "Closed For Business";
		}
		console.log(`admin-settings.js: Operational status updated to: ${status}`);
	}

	// Initial load of operational status
	let currentOperationalStatus = loadOperationalStatus();
	updateOperationalStatusUI(currentOperationalStatus);

	// Event listener for toggling operational hours
	if (toggleOperationalHoursBtn) {
		toggleOperationalHoursBtn.addEventListener("click", () => {
			currentOperationalStatus =
				currentOperationalStatus === "open" ? "closed" : "open";
			saveOperationalStatus(currentOperationalStatus);
			updateOperationalStatusUI(currentOperationalStatus);
			alert(
				`Business is now ${
					currentOperationalStatus === "open" ? "Open" : "Closed"
				} for Business.`
			);
		});
	}

	// --- Location and Price Tags Logic ---
	const locationsTableBody = document.getElementById("locationsTableBody");
	const addLocationBtn = document.getElementById("addLocationBtn");
	const locationModal = document.getElementById("locationModal");
	const closeLocationModalBtn = locationModal
		? locationModal.querySelector(".close-button")
		: null;
	const locationModalTitle = document.getElementById("locationModalTitle");
	const locationForm = document.getElementById("locationForm");
	const locationNameInput = document.getElementById("locationName");
	const dayPriceInput = document.getElementById("dayPrice");
	const nightPriceInput = document.getElementById("nightPrice");
	const saveLocationBtn = document.getElementById("saveLocationBtn");

	const LOCATIONS_KEY = "deliveryLocations"; // Key for localStorage

	let locations = []; // Array to store location objects
	let editingLocationId = null; // To track which location is being edited

	// Function to load locations from localStorage
	function loadLocations() {
		const storedLocations = localStorage.getItem(LOCATIONS_KEY);
		try {
			locations = storedLocations ? JSON.parse(storedLocations) : [];
		} catch (e) {
			console.error(
				"admin-settings.js: Error parsing locations from localStorage:",
				e
			);
			locations = []; // Reset if parsing fails
		}
		console.log("admin-settings.js: Locations loaded:", locations);
	}

	// Function to save locations to localStorage
	function saveLocations() {
		localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
		console.log("admin-settings.js: Locations saved:", locations);
	}

	// Function to render locations into the table
	function renderLocations() {
		if (!locationsTableBody) {
			console.error(
				"admin-settings.js: locationsTableBody not found. Cannot render locations."
			);
			return;
		}
		locationsTableBody.innerHTML = ""; // Clear existing rows

		if (locations.length === 0) {
			locationsTableBody.innerHTML =
				'<tr><td colspan="5" style="text-align: center; padding: 2rem;">No delivery locations added yet.</td></tr>';
			return;
		}

		locations.forEach((location, index) => {
			const row = document.createElement("tr");
			row.innerHTML = `
                <td>${index + 1}</td>
                <td>${location.name}</td>
                <td>₦${parseFloat(location.dayPrice).toFixed(2)}</td>
                <td>₦${parseFloat(location.nightPrice).toFixed(2)}</td>
                <td>
                    <i class="fas fa-edit edit-icon" data-id="${
											location.id
										}" title="Edit Location"></i>
                    <i class="fas fa-trash-alt delete-icon" data-id="${
											location.id
										}" title="Delete Location"></i>
                </td>
            `;
			locationsTableBody.appendChild(row);
		});
		console.log(`admin-settings.js: Rendered ${locations.length} locations.`);
	}

	// --- Modal Control Functions ---
	function openModal(modal) {
		if (modal) modal.style.display = "flex";
	}

	function closeModal(modal) {
		if (modal) modal.style.display = "none";
	}

	// --- Event Listeners for Location Modal ---
	if (addLocationBtn) {
		addLocationBtn.addEventListener("click", () => {
			editingLocationId = null; // Reset for add mode
			locationModalTitle.textContent = "Add New Location";
			saveLocationBtn.textContent = "Add Location";
			locationForm.reset(); // Clear form fields
			openModal(locationModal);
		});
	}

	if (closeLocationModalBtn) {
		closeLocationModalBtn.addEventListener("click", () => {
			closeModal(locationModal);
		});
	}

	if (locationModal) {
		window.addEventListener("click", (event) => {
			if (event.target === locationModal) {
				closeModal(locationModal);
			}
		});
	}

	if (locationForm) {
		locationForm.addEventListener("submit", (event) => {
			event.preventDefault(); // Prevent default form submission

			const name = locationNameInput.value.trim();
			const dayPrice = parseFloat(dayPriceInput.value);
			const nightPrice = parseFloat(nightPriceInput.value);

			if (!name || isNaN(dayPrice) || isNaN(nightPrice)) {
				alert("Please fill in all fields correctly.");
				return;
			}

			if (editingLocationId) {
				// Edit existing location
				const locationIndex = locations.findIndex(
					(loc) => loc.id === editingLocationId
				);
				if (locationIndex !== -1) {
					locations[locationIndex] = {
						...locations[locationIndex], // Keep existing ID
						name,
						dayPrice,
						nightPrice,
					};
					alert("Location updated successfully!");
				}
			} else {
				// Add new location
				const newLocation = {
					id: Date.now().toString(), // Simple unique ID
					name,
					dayPrice,
					nightPrice,
				};
				locations.push(newLocation);
				alert("Location added successfully!");
			}

			saveLocations();
			renderLocations();
			closeModal(locationModal);
			locationForm.reset();
		});
	}

	// --- Event Delegation for Edit/Delete Icons in Location Table ---
	if (locationsTableBody) {
		locationsTableBody.addEventListener("click", (event) => {
			// Edit icon click
			if (event.target.classList.contains("edit-icon")) {
				const idToEdit = event.target.dataset.id;
				const locationToEdit = locations.find((loc) => loc.id === idToEdit);
				if (locationToEdit) {
					editingLocationId = idToEdit; // Set the ID of the location being edited
					locationModalTitle.textContent = "Edit Location";
					saveLocationBtn.textContent = "Update Location";
					locationNameInput.value = locationToEdit.name;
					dayPriceInput.value = locationToEdit.dayPrice;
					nightPriceInput.value = locationToEdit.nightPrice;
					openModal(locationModal);
				}
			}
			// Delete icon click
			else if (event.target.classList.contains("delete-icon")) {
				const idToDelete = event.target.dataset.id;
				const locationToDelete = locations.find((loc) => loc.id === idToDelete);
				if (
					locationToDelete &&
					confirm(
						`Are you sure you want to delete location "${locationToDelete.name}"?`
					)
				) {
					locations = locations.filter((loc) => loc.id !== idToDelete);
					saveLocations();
					renderLocations();
					alert("Location deleted successfully!");
				}
			}
		});
	}

	// --- Initial Load of Locations ---
	loadLocations();
	renderLocations();

	console.log("admin-settings.js: Script finished initialization.");
});
