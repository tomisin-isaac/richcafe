document.addEventListener('DOMContentLoaded', () => {
    console.log("admin-orders.js: Script started.");

    const ordersTableBody = document.querySelector('.orders-table tbody');
    const ordersSearchInput = document.getElementById('ordersSearchInput');
    const filterOrdersBtn = document.getElementById('filterOrdersBtn');

    // Filter Modal elements
    const filterOrdersModal = document.getElementById('filterOrdersModal');
    const closeFilterModalBtn = filterOrdersModal ? filterOrdersModal.querySelector('.close-button') : null;
    const filterOrdersForm = document.getElementById('filterOrdersForm');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const resetFilterBtn = document.getElementById('resetFilterBtn');

    // Dummy Order Data (for demonstration purposes) - ADDED 'date' property
    let orders = [
        {
            no: 1,
            id: '#1234',
            foodDescriptions: 'Full Plate of Rice, Chicken, and Beans',
            location: 'School Road',
            hostelName: 'Hill Crest / D4',
            phoneNo: '09079297785',
            quantity: 1,
            amount: 4500,
            status: 'Completed',
            date: '2025-07-15' // Example Date
        },
        {
            no: 2,
            id: '#1235',
            foodDescriptions: 'Full Plate of Rice, Chicken, and Beans',
            location: 'School Road',
            hostelName: 'Beloved Empire / 5A',
            phoneNo: '09079297785',
            quantity: 3,
            amount: 15500,
            status: 'Pending',
            date: '2025-07-16' // Example Date
        },
        {
            no: 3,
            id: '#1236',
            foodDescriptions: 'Double Beef Burger with Fries, Coca-Cola',
            location: 'Main Campus',
            hostelName: 'Alpha Hostel / B12',
            phoneNo: '08012345678',
            quantity: 2,
            amount: 7000,
            status: 'Processing',
            date: '2025-07-17' // Example Date
        },
        {
            no: 4,
            id: '#1237',
            foodDescriptions: 'Spaghetti Bolognese, Orange Juice',
            location: 'Town Area',
            hostelName: 'No. 24 Green Street',
            phoneNo: '07098765432',
            quantity: 1,
            amount: 3800,
            status: 'Completed',
            date: '2025-07-18' // Example Date
        },
        {
            no: 5,
            id: '#1238',
            foodDescriptions: 'Large Pizza (Pepperoni & Mushroom)',
            location: 'Off-Campus',
            hostelName: 'Private Residence',
            phoneNo: '09011223344',
            quantity: 1,
            amount: 6000,
            status: 'Pending',
            date: '2025-07-18' // Example Date
        },
        {
            no: 6,
            id: '#1239',
            foodDescriptions: 'Chicken Caesar Salad',
            location: 'Student Village',
            hostelName: 'Block C / Room 10',
            phoneNo: '08123456789',
            quantity: 1,
            amount: 2800,
            status: 'Completed',
            date: '2025-07-14' // Example Date
        },
        {
            no: 7,
            id: '#1240',
            foodDescriptions: 'Veggie Wrap with Sweet Potato Fries',
            location: 'Main Campus',
            hostelName: 'Faculty of Arts',
            phoneNo: '07019876543',
            quantity: 2,
            amount: 5000,
            status: 'Processing',
            date: '2025-07-17' // Example Date
        }
    ].sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first

    // Function to open/close modals (reusing from admin-menu.js for consistency)
    function openModal(modal) {
        if (modal) {
            modal.style.display = 'flex';
            console.log(`admin-orders.js: Opened modal: ${modal.id}`);
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            console.log(`admin-orders.js: Closed modal: ${modal.id}`);
        }
    }

    // Function to render orders to the table
    function renderOrders(filteredOrders = orders) {
        if (!ordersTableBody) {
            console.error("admin-orders.js: ordersTableBody not found. Cannot render orders.");
            return;
        }

        ordersTableBody.innerHTML = ''; // Clear existing rows

        if (filteredOrders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 2rem;">No orders found.</td></tr>';
            return;
        }

        filteredOrders.forEach((order, index) => { // Use index for 'No' column
            const row = document.createElement('tr');
            row.dataset.id = order.id;

            // Determine status class for styling
            let statusClass = '';
            switch (order.status.toLowerCase()) {
                case 'completed':
                    statusClass = 'status-completed';
                    break;
                case 'pending':
                    statusClass = 'status-pending';
                    break;
                case 'processing':
                    statusClass = 'status-processing';
                    break;
                default:
                    statusClass = '';
            }

            row.innerHTML = `
                <td>${index + 1}</td> <td>${order.id}</td>
                <td>${order.foodDescriptions}</td>
                <td>${order.location}</td>
                <td>${order.hostelName}</td>
                <td>${order.phoneNo}</td>
                <td>${order.quantity}</td>
                <td>₦${order.amount.toLocaleString()}</td>
                <td><span class="order-status ${statusClass}">${order.status}</span></td>
                <td>
                    <i class="fas fa-eye view-order-icon" data-id="${order.id}" title="View Order Details"></i>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
        console.log(`admin-orders.js: Rendered ${filteredOrders.length} orders.`);
    }

    // --- Search Functionality ---
    if (ordersSearchInput) {
        ordersSearchInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase().trim();
            const filtered = orders.filter(order =>
                order.id.toLowerCase().includes(searchTerm) ||
                order.foodDescriptions.toLowerCase().includes(searchTerm) ||
                order.location.toLowerCase().includes(searchTerm) ||
                order.hostelName.toLowerCase().includes(searchTerm) ||
                order.phoneNo.includes(searchTerm) ||
                order.status.toLowerCase().includes(searchTerm)
            );
            renderOrders(filtered);
            console.log(`admin-orders.js: Orders searched for: "${searchTerm}". ${filtered.length} results.`);
        });
    }

    // --- Filter Functionality ---
    if (filterOrdersBtn) {
        filterOrdersBtn.addEventListener('click', () => {
            openModal(filterOrdersModal);
            console.log("admin-orders.js: Filter button clicked, opening modal.");
        });
    }

    // Close Filter Modal using the close button
    if (closeFilterModalBtn) {
        closeFilterModalBtn.addEventListener('click', () => {
            closeModal(filterOrdersModal);
        });
    }

    // Close Filter Modal by clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === filterOrdersModal) {
            closeModal(filterOrdersModal);
        }
    });

    // Apply Filter Form Submission
    if (filterOrdersForm) {
        filterOrdersForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission
            console.log("admin-orders.js: Filter form submitted.");

            const startDate = startDateInput.value;
            const endDate = endDateInput.value;

            let filtered = orders;

            if (startDate && endDate) {
                // Ensure dates are valid for comparison
                const start = new Date(startDate);
                const end = new Date(endDate);
                end.setDate(end.getDate() + 1); // Include the end date fully

                filtered = orders.filter(order => {
                    const orderDate = new Date(order.date);
                    return orderDate >= start && orderDate < end;
                });
                console.log(`admin-orders.js: Filtered by date range: ${startDate} to ${endDate}. ${filtered.length} results.`);
            } else if (startDate) {
                const start = new Date(startDate);
                filtered = orders.filter(order => {
                    const orderDate = new Date(order.date);
                    return orderDate >= start;
                });
                console.log(`admin-orders.js: Filtered by start date: ${startDate}. ${filtered.length} results.`);
            } else if (endDate) {
                const end = new Date(endDate);
                end.setDate(end.getDate() + 1); // Include the end date fully
                filtered = orders.filter(order => {
                    const orderDate = new Date(order.date);
                    return orderDate < end;
                });
                console.log(`admin-orders.js: Filtered by end date: ${endDate}. ${filtered.length} results.`);
            } else {
                console.log("admin-orders.js: No dates selected for filter. Showing all orders.");
            }

            renderOrders(filtered);
            closeModal(filterOrdersModal);
        });
    }

    // Reset Filter Button
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', () => {
            startDateInput.value = ''; // Clear start date input
            endDateInput.value = '';   // Clear end date input
            renderOrders(); // Re-render all original orders
            closeModal(filterOrdersModal);
            console.log("admin-orders.js: Filter reset, showing all orders.");
        });
    }

    // --- Initial Load ---
    try {
        console.log("admin-orders.js: Initializing orders page.");
        renderOrders(); // Display all orders on initial load
        console.log("admin-orders.js: Orders page initialization complete.");
    } catch (error) {
        console.error("admin-orders.js: Initialization Error:", error);
        alert("An error occurred during orders page initialization. Please check the console for details.");
    }

    // Optional: Event delegation for action icons in the table
    if (ordersTableBody) {
        ordersTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('view-order-icon')) {
                const orderId = event.target.dataset.id;
                const orderDetails = orders.find(order => order.id === orderId);
                if (orderDetails) {
                    alert(`Viewing details for Order ID: ${orderId}\nFood: ${orderDetails.foodDescriptions}\nDate: ${orderDetails.date}\nStatus: ${orderDetails.status}`);
                    console.log(`admin-orders.js: View icon clicked for Order ID: ${orderId}`);
                }
            }
        });
    }
});