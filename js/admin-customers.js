document.addEventListener('DOMContentLoaded', () => {
    console.log("admin-customers.js: Script started.");

    const customersTableBody = document.querySelector('.customers-table tbody');
    const customersSearchInput = document.getElementById('customersSearchInput');

    // Function to load customer data from localStorage
    // If no data exists, it returns an empty array.
    function loadCustomersFromLocalStorage() {
        const customersJson = localStorage.getItem('customers');
        return customersJson ? JSON.parse(customersJson) : [];
    }

    // Initialize customers array by loading from localStorage
    let customers = loadCustomersFromLocalStorage();

    // Function to render customers to the table
    function renderCustomers(filteredCustomers = customers) {
        if (!customersTableBody) {
            console.error("admin-customers.js: customersTableBody not found. Cannot render customers.");
            return;
        }

        customersTableBody.innerHTML = ''; // Clear existing rows

        if (filteredCustomers.length === 0) {
            customersTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem;">No customers found. Register new customers from the index page.</td></tr>';
            return;
        }

        filteredCustomers.forEach((customer, index) => { // Use index for 'No' column for simple sequential numbering
            const row = document.createElement('tr');
            row.dataset.phoneNumber = customer.phoneNumber; // Store phone number for potential future actions

            row.innerHTML = `
                <td>${index + 1}</td> <td>${customer.fullName}</td>
                <td>${customer.emailAddress}</td>
                <td>${customer.phoneNumber}</td>
                <td>
                    <i class="fas fa-eye view-customer-icon" data-phone="${customer.phoneNumber}" title="View Customer Details"></i>
                    </td>
            `;
            customersTableBody.appendChild(row);
        });
        console.log(`admin-customers.js: Rendered ${filteredCustomers.length} customers.`);
    }

    // --- Search Functionality ---
    if (customersSearchInput) {
        customersSearchInput.addEventListener('keyup', (event) => {
            const searchTerm = event.target.value.toLowerCase().trim();
            const filtered = customers.filter(customer =>
                customer.fullName.toLowerCase().includes(searchTerm) ||
                customer.emailAddress.toLowerCase().includes(searchTerm) ||
                customer.phoneNumber.includes(searchTerm)
            );
            renderCustomers(filtered);
            console.log(`admin-customers.js: Customers searched for: "${searchTerm}". ${filtered.length} results.`);
        });
    }

    // --- Initial Load ---
    try {
        console.log("admin-customers.js: Initializing customers page.");
        renderCustomers(); // Display all customers on initial load
        console.log("admin-customers.js: Customers page initialization complete.");
    } catch (error) {
        console.error("admin-customers.js: Initialization Error:", error);
        alert("An error occurred during customers page initialization. Please check the console for details.");
    }

    // Optional: Event delegation for action icons in the table
    if (customersTableBody) {
        customersTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('view-customer-icon')) {
                const customerPhone = event.target.dataset.phone;
                // Find the customer in the *original* `customers` array, not the filtered one
                const customerDetails = customers.find(customer => customer.phoneNumber === customerPhone);
                if (customerDetails) {
                    alert(`Viewing details for Customer: ${customerDetails.fullName}\nEmail: ${customerDetails.emailAddress}\nPhone: ${customerDetails.phoneNumber}`);
                    console.log(`admin-customers.js: View icon clicked for customer: ${customerDetails.fullName}`);
                }
            }
        });
    }
});