document.addEventListener('DOMContentLoaded', () => {
    console.log("user-homepage.js: DOM Content Loaded.");

    // --- Helper Functions to Load Data from Local Storage ---
    function loadCategoriesFromLocalStorage() {
        try {
            const storedCategories = localStorage.getItem('categories');
            return storedCategories ? JSON.parse(storedCategories) : [];
        } catch (e) {
            console.error("Error loading categories from Local Storage:", e);
            return [];
        }
    }

    function loadMenuItemsFromLocalStorage() {
        try {
            const storedMenuItems = localStorage.getItem('menuItems');
            const items = storedMenuItems ? JSON.parse(storedMenuItems) : [];

            // Ensure the 'sizes' array exists for items and add a default price if missing.
            const formattedItems = items.map(item => {
                if (!item.sizes || item.sizes.length === 0) {
                    // Fallback for items with no sizes, ensuring we can display a price.
                    return {
                        ...item,
                        sizes: [{ size: 'Default', price: item.price || 0 }]
                    };
                }
                return item;
            });
            return formattedItems;
        } catch (e) {
            console.error("Error loading menu items from Local Storage:", e);
            return [];
        }
    }

    let categories = loadCategoriesFromLocalStorage();
    let menuItems = loadMenuItemsFromLocalStorage();

    // --- DOM Elements ---
    const userCategoryContainer = document.querySelector('.user-dashboard-categories');
    const userFoodItemsContainer = document.querySelector('.user-dashboard-available');

    // --- Render Categories ---
    function renderUserCategories() {
        console.log("user-homepage.js: Rendering user categories.");
        if (!userCategoryContainer) {
            console.error("user-dashboard-categories element not found.");
            return;
        }
        userCategoryContainer.innerHTML = ''; // Clear existing static content

        // Filter out the 'All' category if it exists, as we'll handle it separately
        const categoriesToDisplay = categories.filter(cat => cat.name.toLowerCase() !== 'all');

        if (categoriesToDisplay.length === 0) {
            userCategoryContainer.innerHTML = '<p style="text-align: center; width: 100%;">No categories available.</p>';
            return;
        }

        // Create an 'All' category card to show all food items
        const allCategoryCard = document.createElement('div');
        allCategoryCard.classList.add('user-dashboard-category-item', 'active');
        allCategoryCard.dataset.categoryId = 'all';
        allCategoryCard.innerHTML = `
            <img src="images/all.png" alt="All">
            <p>All</p>
        `;
        userCategoryContainer.appendChild(allCategoryCard);

        categoriesToDisplay.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.classList.add('user-dashboard-category-item');
            categoryCard.dataset.categoryId = category.id; // Store category ID for filtering

            categoryCard.innerHTML = `
                <img src="${category.imageUrl || 'https://via.placeholder.com/80'}" alt="${category.name}">
                <p>${category.name}</p>
            `;
            userCategoryContainer.appendChild(categoryCard);
        });

        // Add click listener for filtering to the parent container using event delegation
        userCategoryContainer.addEventListener('click', (event) => {
            const clickedCategory = event.target.closest('.user-dashboard-category-item');
            if (clickedCategory) {
                // Remove active class from all categories
                document.querySelectorAll('.user-dashboard-category-item').forEach(card => card.classList.remove('active'));
                // Add active class to the clicked category
                clickedCategory.classList.add('active');
                // Render items for the selected category
                renderUserMenuItems(clickedCategory.dataset.categoryId);
            }
        });
    }

    // --- Render Menu Items ---
    function renderUserMenuItems(selectedCategoryId = 'all') {
        console.log(`user-homepage.js: Rendering user menu items for category: ${selectedCategoryId}.`);
        if (!userFoodItemsContainer) {
            console.error("user-dashboard-available element not found.");
            return;
        }

        // Clear existing food items while keeping the heading
        const foodGrid = document.querySelector('.user-dashboard-food-grid');
        if (foodGrid) {
            foodGrid.innerHTML = '';
        } else {
            userFoodItemsContainer.innerHTML = '<h2>Available Food</h2><div class="user-dashboard-food-grid"></div>';
        }
        const newFoodGrid = document.querySelector('.user-dashboard-food-grid');

        let itemsToDisplay = menuItems.filter(item => item.status === 'Available');

        if (selectedCategoryId !== 'all') {
            itemsToDisplay = itemsToDisplay.filter(item => item.categoryId === selectedCategoryId);
        }

        if (itemsToDisplay.length === 0) {
            newFoodGrid.innerHTML = '<p style="text-align: center; width: 100%; padding: 2rem;">No available food items in this category.</p>';
            return;
        }

        itemsToDisplay.forEach(item => {
            const foodItemCard = document.createElement('div');
            foodItemCard.classList.add('user-dashboard-food-card');

            // Find the lowest price to display
            let displayPrice = 'N/A';
            if (item.sizes && item.sizes.length > 0) {
                const minPrice = Math.min(...item.sizes.map(s => s.price));
                displayPrice = `₦${minPrice.toLocaleString('en-NG')}`;
            }

            // Create an outer div for the card's entire content
            const cardContent = document.createElement('div');
            cardContent.classList.add('user-dashboard-food-card-content'); // A new class to hold content, not in original HTML

            cardContent.innerHTML = `
                <div class="user-dashboard-food-img" style="background-image: url('${item.imageUrl || 'https://via.placeholder.com/400x200'}');"></div>
                <div class="user-dashboard-food-info">
                    <div class="user-dashboard-food-details">
                        <h3>${item.name}</h3>
                        <span class="user-dashboard-food-price">${displayPrice}</span>
                    </div>
                    <p>Preparation Time | ${item.prepTime || 'N/A'} min</p>
                </div>
            `;
            foodItemCard.appendChild(cardContent);
            // 🔹 Add click event here
            foodItemCard.addEventListener('click', () => {
                sessionStorage.setItem('selectedProductId', item.id);
                window.location.href = 'product-details.html';
            });
            newFoodGrid.appendChild(foodItemCard);
        });
    }

    // --- Initial Load ---
    renderUserCategories();
    renderUserMenuItems('all'); // Load all items initially

    // --- Placeholder for search functionality ---
    const searchInput = document.querySelector('.user-dashboard-search-input');
    const searchBtn = document.querySelector('.user-dashboard-search-btn');

    const handleSearch = () => {
        const searchTerm = searchInput.value.toLowerCase();
        let itemsToDisplay = menuItems.filter(item => item.status === 'Available');

        // Filter based on item name or category name
        itemsToDisplay = itemsToDisplay.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            categories.find(cat => cat.id === item.categoryId)?.name.toLowerCase().includes(searchTerm)
        );

        // Clear category active states
        document.querySelectorAll('.user-dashboard-category-item').forEach(card => card.classList.remove('active'));

        // Render the filtered items
        renderUserMenuItemsFromSearch(itemsToDisplay);
    };

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleSearch();
            }
        });
    }

    function renderUserMenuItemsFromSearch(items) {
        const newFoodGrid = document.querySelector('.user-dashboard-food-grid');
        newFoodGrid.innerHTML = ''; // Clear previous content

        if (items.length === 0) {
            newFoodGrid.innerHTML = '<p style="text-align: center; width: 100%; padding: 2rem;">No matching food items found.</p>';
            return;
        }

        items.forEach(item => {
            const foodItemCard = document.createElement('div');
            foodItemCard.classList.add('user-dashboard-food-card');

            let displayPrice = 'N/A';
            if (item.sizes && item.sizes.length > 0) {
                const minPrice = Math.min(...item.sizes.map(s => s.price));
                displayPrice = `₦${minPrice.toLocaleString('en-NG')}`;
            }

            const cardContent = document.createElement('div');
            cardContent.classList.add('user-dashboard-food-card-content');
            
            cardContent.innerHTML = `
                <div class="user-dashboard-food-img" style="background-image: url('${item.imageUrl || 'https://via.placeholder.com/400x200'}');"></div>
                <div class="user-dashboard-food-info">
                    <div class="user-dashboard-food-details">
                        <h3>${item.name}</h3>
                        <span class="user-dashboard-food-price">${displayPrice}</span>
                    </div>
                    <p>Preparation Time | ${item.prepTime || 'N/A'} min</p>
                </div>
            `;
            foodItemCard.appendChild(cardContent);
            // 🔹 Add click event here
            foodItemCard.addEventListener('click', () => {
                sessionStorage.setItem('selectedProductId', item.id);
                window.location.href = 'product-details.html';
            });
            newFoodGrid.appendChild(foodItemCard);
        });
    }

});