// js/admin-login.js
document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminUsernameInput = document.getElementById('adminUsername');
    const adminEmailInput = document.getElementById('adminEmail');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminLoginStatus = document.getElementById('adminLoginStatus');

    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            adminLoginStatus.textContent = ''; // Clear previous messages
            adminLoginStatus.style.color = ''; // Reset color

            const credentials = {
                username: adminUsernameInput.value.trim(),
                email: adminEmailInput.value.trim(),
                password: adminPasswordInput.value.trim()
            };

            console.log('Frontend (Admin Login): Sending credentials:', credentials);

            try {
                const response = await fetch('http://localhost:3000/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });

                const data = await response.json();
                console.log('Frontend (Admin Login): Received response:', data);

                if (response.ok) {
                    adminLoginStatus.textContent = data.message;
                    adminLoginStatus.style.color = 'green';
                    // Successful login. Redirect to admin dashboard
                    window.location.href = 'admin-dashboard.html';
                } else {
                    adminLoginStatus.textContent = data.message || 'Admin login failed.';
                    adminLoginStatus.style.color = 'red';
                }
            } catch (error) {
                console.error('Frontend (Admin Login): Error during login:', error);
                adminLoginStatus.textContent = 'Network error or server unavailable.';
                adminLoginStatus.style.color = 'red';
            }
        });
    }
});