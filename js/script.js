// --- Inside your script.js file (authentication related) ---

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const countryCodeSelect = document.getElementById('countryCode');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const emailInput = document.getElementById('email');
    const userNameInput = document.getElementById('userName');
    const registrationStatus = document.getElementById('registrationStatus');

    // NEW: Function to handle a successful login/registration
    function handleSuccessfulLogin(userData) {
        // Prepare the user object to save to local storage
        const user = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
        };

        // Save the single user object to localStorage under 'currentUser' for the profile page
        localStorage.setItem('currentUser', JSON.stringify(user));

        // Save customer data to the 'customers' array for admin use
        saveCustomerToLocalStorage({
            fullName: user.name,
            emailAddress: user.email,
            phoneNumber: user.phone,
        });

        console.log("Logged in user saved to 'currentUser' and 'customers' array.");
    }


    // Function to save customer data to localStorage
    function saveCustomerToLocalStorage(customer) {
        let customers = JSON.parse(localStorage.getItem('customers')) || [];

        // Check if a customer with the same phone number or email already exists
        const exists = customers.some(
            c => c.emailAddress === customer.emailAddress || c.phoneNumber === customer.phoneNumber
        );

        if (!exists) {
            // Assign a simple sequential 'no' for display purposes in admin panel
            customer.no = customers.length + 1;
            customers.push(customer);
            localStorage.setItem('customers', JSON.stringify(customers));
            console.log("Customer saved to localStorage:", customer);
        } else {
            console.log("Customer already exists in localStorage, not adding:", customer);
        }
    }

    if (registrationForm) {
        registrationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            registrationStatus.textContent = '';
            registrationStatus.style.color = '';

            const fullPhoneNumber = countryCodeSelect.value + phoneNumberInput.value.trim();

            if (countryCodeSelect.value === '+234' && phoneNumberInput.value.trim().length !== 10) {
                registrationStatus.textContent = 'Please enter a valid 10-digit Nigerian phone number (e.g., 8012345678, NOT starting with 0).';
                registrationStatus.style.color = 'red';
                return;
            } else if (phoneNumberInput.value.trim().length < 7 || phoneNumberInput.value.trim().length > 15) {
                registrationStatus.textContent = 'Please enter a valid phone number (7-15 digits after country code).';
                registrationStatus.style.color = 'red';
                return;
            }

            const registrationData = {
                phone: fullPhoneNumber,
                email: emailInput.value.trim(),
                name: userNameInput.value.trim()
            };

            console.log('Frontend (script.js): Sending registration/login data:', registrationData);

            try {
                const response = await fetch('http://localhost:3000/auth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(registrationData)
                });

                const data = await response.json();
                console.log('Frontend (script.js): Received response:', data);

                if (response.ok) {
                    if (data.status === 'otp_sent') {
                        sessionStorage.setItem('pendingRegistration', JSON.stringify({
                            tempId: data.tempId,
                            phone: fullPhoneNumber
                        }));

                        registrationStatus.textContent = data.message;
                        registrationStatus.style.color = 'green';
                        window.location.href = 'verify-code.html';
                    } else if (data.status === 'login_success') {
                        registrationStatus.textContent = data.message;
                        registrationStatus.style.color = 'green';

                        // --- NEW: Handle successful login and save user data ---
                        handleSuccessfulLogin(data.user || registrationData);
                        window.location.href = 'homepage.html';
                        // --- End NEW ---
                    } else {
                        registrationStatus.textContent = data.message || 'An unexpected status was received.';
                        registrationStatus.style.color = 'orange';
                    }
                } else {
                    registrationStatus.textContent = data.message || 'Registration/Login failed.';
                    registrationStatus.style.color = 'red';
                }
            } catch (error) {
                console.error('Frontend (script.js): Error during registration/login fetch:', error);
                registrationStatus.textContent = 'Network error or server unavailable. Please check your connection.';
                registrationStatus.style.color = 'red';
            }
        });
    }

    // --- All other existing functions remain below this line ---

    // NO CHART CODE SHOULD BE HERE

    // --- NEW: Order List Section JavaScript (Simulated Data) ---
    const orderTableBody = document.getElementById('orderTableBody');
    const filterPendingBtn = document.getElementById('filterPending');
    const filterCompletedBtn = document.getElementById('filterCompleted');

    // --- Simulated Order Data ---
    // This array will hold all our order data.
    // In a real application, this would come from your backend.
    let ordersData = [
        {
            id: '1234',
            foodDescriptions: 'Full Plate of Rice, chicken, and beans',
            location: 'School Road',
            hostelNameNo: 'Hill Crest / D4',
            phoneNo: '09079297785',
            amount: 'N9297785',
            status: 'Pending'
        },
        {
            id: '1235',
            foodDescriptions: 'Burger and Milkshake',
            location: 'Main Campus',
            hostelNameNo: 'Block A / Room 10',
            phoneNo: '08123456789',
            amount: 'N5500',
            status: 'Pending'
        },
        {
            id: '1236',
            foodDescriptions: 'Large Pizza, extra cheese',
            location: 'Town Area',
            hostelNameNo: '24b Market Street',
            phoneNo: '07011223344',
            amount: 'N12000',
            status: 'Completed'
        },
        {
            id: '1237',
            foodDescriptions: 'Jollof Rice with plantain',
            location: 'Student Hostel',
            hostelNameNo: 'New Hall / Room 22',
            phoneNo: '08098765432',
            amount: 'N7000',
            status: 'Pending'
        },
        {
            id: '1238',
            foodDescriptions: 'Chicken Caesar Salad',
            location: 'Staff Quarters',
            hostelNameNo: 'House 5',
            phoneNo: '09001122334',
            amount: 'N6000',
            status: 'Completed'
        },
    ];

    let currentFilter = 'Pending'; // Default filter

    // Function to render orders into the table based on the current filter
    function renderOrders() {
        if (!orderTableBody) return; // Exit if element doesn't exist (e.g., on auth pages)

        orderTableBody.innerHTML = ''; // Clear existing rows

        const filteredOrders = ordersData.filter(order => {
            if (currentFilter === 'All') return true; // Optional: for an 'All Orders' view
            return order.status === currentFilter;
        });

        if (filteredOrders.length === 0) {
            orderTableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px;">No ${currentFilter.toLowerCase()} orders found.</td></tr>`;
            return;
        }

        filteredOrders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.setAttribute('data-order-id', order.id); // Store ID for easy lookup

            // Determine button class based on status
            const statusClass = order.status === 'Pending' ? 'status-pending' : 'status-completed';

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>#${order.id}</td>
                <td>${order.foodDescriptions}</td>
                <td>${order.location}</td>
                <td>${order.hostelNameNo}</td>
                <td>${order.phoneNo}</td>
                <td>${order.amount}</td>
                <td>
                    <button class="${statusClass}" data-status="${order.status.toLowerCase()}">${order.status}</button>
                </td>
            `;
            orderTableBody.appendChild(row);
        });

        attachStatusButtonListeners(); // Re-attach listeners after rendering
    }

    // Function to attach event listeners to status buttons (inside the table)
    function attachStatusButtonListeners() {
        document.querySelectorAll('.order-list-section button[data-status="pending"]').forEach(button => {
            button.onclick = () => {
                const row = button.closest('tr');
                const orderId = row.dataset.orderId;

                // Find the order in our data and update its status
                const orderIndex = ordersData.findIndex(order => order.id === orderId);
                if (orderIndex !== -1) {
                    ordersData[orderIndex].status = 'Completed'; // Update status

                    // After updating, re-render the list based on the current filter
                    // If currentFilter is 'Pending', this will effectively remove the row.
                    renderOrders();
                }
            };
        });
        // No click listener needed for "completed" buttons if they don't do anything
    }

    // Event listeners for the filter buttons (Pending/Completed)
    if (filterPendingBtn && filterCompletedBtn) { // Check if buttons exist (only on admin dashboard)
        filterPendingBtn.addEventListener('click', () => {
            currentFilter = 'Pending';
            renderOrders();
            filterPendingBtn.classList.add('active-filter');
            filterCompletedBtn.classList.remove('active-filter');
        });

        filterCompletedBtn.addEventListener('click', () => {
            currentFilter = 'Completed';
            renderOrders();
            filterCompletedBtn.classList.add('active-filter');
            filterPendingBtn.classList.remove('active-filter');
        });

        // Initial render when the page loads, showing only pending orders
        renderOrders();
        filterPendingBtn.classList.add('active-filter'); // Set initial active state for Pending button
    }


    // --- Dashboard Chart and Sidebar Toggle Logic ---
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const darkModeToggle = document.getElementById('darkModeToggle'); // Ensure this ID exists in your HTML
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

    // Sidebar and mobile nav active state
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function() {
            mobileNavItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });

    if (menuToggle && sidebar && mainContent) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('hidden');
            mainContent.classList.toggle('sidebar-hidden');
        });
    }

    // Dark mode toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            // Save user preference
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }
        });

        // Apply saved theme on load
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }


    // Dummy Chart.js setup (if elements exist on the page)
    const salesBarChartCtx = document.getElementById('salesBarChart');
    if (salesBarChartCtx) {
        new Chart(salesBarChartCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Sales',
                    data: [12000, 19000, 3000, 5000, 20000, 30000],
                    backgroundColor: 'rgba(40, 167, 69, 0.7)', // Primary green
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)' // Light grid lines
                        },
                        ticks: {
                            color: 'var(--text-light)' // Ensure text is visible in dark mode
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: 'var(--text-light)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    const ordersDonutChartCtx = document.getElementById('ordersDonutChart');
    if (ordersDonutChartCtx) {
        new Chart(ordersDonutChartCtx, {
            type: 'doughnut',
            data: {
                labels: ['Rice Orders', 'Burger Orders', 'Milkshake Orders'],
                datasets: [{
                    data: [300, 50, 100], // Sample data
                    backgroundColor: [
                        'var(--green-accent)', // Matches sales green
                        'var(--donut-segment-light-pink)', // From CSS var
                        'var(--donut-segment-dark-blue)' // From CSS var
                    ],
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%', // Makes it a donut
                plugins: {
                    legend: {
                        display: false // We'll use custom legend in HTML
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed !== null) {
                                    label += context.parsed + ' orders';
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }
});