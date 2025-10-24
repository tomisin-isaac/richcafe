document.addEventListener('DOMContentLoaded', () => {
    const codeInputs = document.querySelectorAll('.code-digit');
    const verifyCodeForm = document.getElementById('verifyCodeForm');
    const resendCodeLink = document.getElementById('resendCodeLink');
    const displayPhoneNumberElement = document.getElementById('displayPhoneNumber');

    // Retrieve pending registration data
    const pendingRegistration = JSON.parse(sessionStorage.getItem('pendingRegistration'));

    // Display phone number if available
    if (displayPhoneNumberElement && pendingRegistration && pendingRegistration.phone) {
        displayPhoneNumberElement.textContent = pendingRegistration.phone;
    } else {
        displayPhoneNumberElement.textContent = 'your number'; // Default text if not found
        // If no pending registration is found, it's good practice to redirect them back
        // to the initial registration page, or show a clear message.
        console.warn('Frontend (verify-code.js): No pending registration data found in sessionStorage.');
        // Consider redirecting here: window.location.href = 'index.html';
    }

    // Auto-focus the first input
    if (codeInputs[0]) {
        codeInputs[0].focus();
    }

    // Handle input navigation and concatenate digits
    codeInputs.forEach((input, index) => {
        input.addEventListener('input', () => {
            if (input.value.length === 1 && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
            // Auto-submit if all digits are entered (optional, can be annoying)
            // const enteredCode = Array.from(codeInputs).map(i => i.value).join('');
            // if (enteredCode.length === 6) {
            //     verifyCodeForm.submit();
            // }
        });

        input.addEventListener('keydown', (e) => {
            // Move to previous input on Backspace if current is empty
            if (e.key === 'Backspace' && input.value === '' && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
    });

    // Handle form submission for code verification
    if (verifyCodeForm) {
        verifyCodeForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const enteredCode = Array.from(codeInputs).map(input => input.value).join('');

            if (enteredCode.length !== 6) {
                alert('Please enter the full 6-digit code.');
                return;
            }

            if (!pendingRegistration || !pendingRegistration.tempId) {
                console.error('Frontend (verify-code.js): Error: No pending registration found in sessionStorage during submission.');
                alert('No pending registration found. Please start again from the welcome page.');
                window.location.href = 'index.html';
                return;
            }

            console.log('Frontend (verify-code.js): Attempting to verify code...');
            console.log('Frontend (verify-code.js): tempId:', pendingRegistration.tempId);
            console.log('Frontend (verify-code.js): OTP:', enteredCode);
            console.log('Frontend (verify-code.js): Phone from session:', pendingRegistration.phone);

            try {
                const response = await fetch('http://localhost:3000/verify-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tempId: pendingRegistration.tempId,
                        otp: enteredCode,
                        phone: pendingRegistration.phone // Pass phone number for robust check
                    })
                });

                console.log('Frontend (verify-code.js): Received response status:', response.status);
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const result = await response.json();
                    console.log('Frontend (verify-code.js): Received response body:', result);

                    if (response.ok) {
                        alert(result.message);

                            if (result.user) {
                            localStorage.setItem("userProfileData", JSON.stringify({
                                name: result.user.name,
                                email: result.user.email,
                                phone: result.user.phone
                            }));
                            localStorage.setItem("isLoggedIn", "true");
                        }
                        sessionStorage.removeItem('pendingRegistration'); // Clear session storage
                        window.location.href = 'homepage.html'; // Successfully registered and logged in
                    } else {
                        alert('Code verification failed: ' + result.message);
                    }
                } else {
                    const textError = await response.text();
                    console.error('Frontend (verify-code.js): Server response not JSON:', textError);
                    alert('An unexpected server response occurred during verification. Please check the backend console.');
                }
            } catch (error) {
                console.error('Frontend (verify-code.js): Network or fetch error during OTP verification:', error);
                alert('An error occurred during code verification. Please try again.');
            }
        });
    }

    // Handle resend code functionality
    if (resendCodeLink) {
        resendCodeLink.addEventListener('click', async (event) => {
            event.preventDefault();
            const pendingRegistration = JSON.parse(sessionStorage.getItem('pendingRegistration'));

            if (!pendingRegistration || !pendingRegistration.phone) {
                alert('No pending registration found. Please start again from the welcome page.');
                window.location.href = 'index.html';
                return;
            }

            console.log('Frontend (verify-code.js): Attempting to resend OTP for:', pendingRegistration.phone);


            try {
                const response = await fetch('http://localhost:3000/resend-otp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phone: pendingRegistration.phone,
                        tempId: pendingRegistration.tempId // Pass tempId for more precise resend if backend needs it
                    })
                });

                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const result = await response.json();
                    console.log('Frontend (verify-code.js): Resend OTP response body:', result);

                    if (response.ok) {
                        alert(result.message);
                        // Optionally update tempId in sessionStorage if backend returns a new one,
                        // though current backend reuses it.
                    } else {
                        alert('Resend failed: ' + result.message);
                    }
                } else {
                    const textError = await response.text();
                    console.error('Frontend (verify-code.js): Server response not JSON on resend:', textError);
                    alert('An unexpected server response occurred during resend. Please check the backend console.');
                }
            } catch (error) {
                console.error('Frontend (verify-code.js): Network or fetch error during resend OTP:', error);
                alert('An error occurred while trying to resend the code.');
            }
        });
    }
});