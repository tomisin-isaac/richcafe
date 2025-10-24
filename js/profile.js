document.addEventListener("DOMContentLoaded", () => {
    // --- Profile Picture Functionality ---
    const fileInput = document.getElementById("profile-image-upload");
    const profileImage = document.querySelector(".profile-picture-img");

    if (fileInput) {
        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    profileImage.src = e.target.result;

                    // Save updated profile image to localStorage
                    let currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
                    currentUser.profileImage = e.target.result;
                    localStorage.setItem("currentUser", JSON.stringify(currentUser));
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // --- User Profile Data Functionality ---
    const usernameElement = document.querySelector(".profile-username");
    const nameElement = document.querySelector(".profile-name");
    const emailElement = document.querySelector(".profile-email");
    const phoneElement = document.querySelector(".profile-phone");

    function loadUserProfile() {
        try {
            const userProfileData = JSON.parse(localStorage.getItem("currentUser"));

            if (userProfileData) {
                usernameElement.textContent = userProfileData.name || "User Name";
                nameElement.textContent = userProfileData.name || "Not Available";
                emailElement.textContent = userProfileData.email || "Not Available";
                phoneElement.textContent = userProfileData.phone || "Not Available";

                if (userProfileData.profileImage) {
                    profileImage.src = userProfileData.profileImage || "/images/default-avatar.png";
                }
            } else {
                console.warn("No user data found in localStorage. Please ensure login page saves user info as 'currentUser'.");
                localStorage.removeItem("currentUser");
                window.location.href = "index.html";
            }
        } catch (e) {
            console.error("Error loading user profile from localStorage:", e);
        }
    }

    loadUserProfile();
});




const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        const confirmLogout = confirm("Are you sure you want to log out?");
        
        if (confirmLogout) {
            // Clear user session
            localStorage.removeItem("currentUser");

            // Redirect to index page
            window.location.href = "index.html";
        }
    });
}
