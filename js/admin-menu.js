document.addEventListener('DOMContentLoaded', () => {
    console.log("admin-menu.js: DOMContentLoaded - Script started.");

    // --- Modal Functionality ---
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    const addItemBtn = document.getElementById('addItemBtn');
    const addCategoryModal = document.getElementById('addCategoryModal');
    const addItemModal = document.getElementById('addItemModal');
    const closeButtons = document.querySelectorAll('.modal .close-button');

    function openModal(modal) {
        modal.style.display = 'flex'; // Use flex to center
        console.log(`admin-menu.js: Opened modal: ${modal.id}`);
    }

    function closeModal(modal) {
        modal.style.display = 'none';
        console.log(`admin-menu.js: Closed modal: ${modal.id}`);
    }

    // Open Add Category Modal
    if (addCategoryBtn && addCategoryModal) {
        addCategoryBtn.addEventListener('click', () => {
            setCategoryModalMode('add'); // Reset modal to 'add' mode when opening via 'Add Category' button
            openModal(addCategoryModal);
        });
    }

    // A variable to store the ID of the currently active category for new item creation
    let activeCategoryIdForNewItem = null; // Initially null, will be set to a specific category ID or null for 'all'

    // Open Add Item Modal
    if (addItemBtn && addItemModal) {
        addItemBtn.addEventListener('click', () => {
            const activeCategoryCard = document.querySelector('.category-card.active-category');
            if (activeCategoryCard && activeCategoryCard.dataset.id !== 'all') { // Only allow adding if a specific category is active
                activeCategoryIdForNewItem = activeCategoryCard.dataset.id;
                console.log(`admin-menu.js: Add Item button clicked. New items will be added to category: ${activeCategoryIdForNewItem}`);
                setAddItemModalMode('add'); // Set modal to add mode
                openModal(addItemModal);
            } else {
                activeCategoryIdForNewItem = null;
                console.warn("admin-menu.js: Add Item button clicked but no specific category is active. Button should be hidden.");
                // Alert should ideally not be needed if button is correctly hidden
                alert("Please select a specific category to add an item.");
            }
        });
    }

    // Close Modals using the close button
    closeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            closeModal(event.target.closest('.modal'));
        });
    });

    // Close Modals by clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === addCategoryModal) {
            closeModal(addCategoryModal);
        }
        if (event.target === addItemModal) {
            closeModal(addItemModal);
        }
    });

    // --- Category Data Management (Local Storage & Rendering) ---
    let categories = []; // This array will hold the current categories

    // Variables to manage category modal state
    let currentCategoryModalMode = 'add'; // 'add' or 'edit'
    let editingCategoryId = null; // Stores the ID of the category being edited

    // DOM elements for category form
    const categoryModalTitle = document.getElementById('categoryModalTitle');
    const categoryModalSubmitButton = document.getElementById('categoryModalSubmitButton');
    const categoryTitleInput = document.getElementById('categoryTitle');
    const categoryImageInput = document.getElementById('categoryImage');
    const categoryImagePreview = document.getElementById('categoryImagePreview');

    // Function to load categories from Local Storage and ensure 'All Categories' is present
    function loadCategoriesFromLocalStorage() {
        console.log("admin-menu.js: Loading categories from Local Storage...");
        const storedCategories = localStorage.getItem('categories');
        if (storedCategories) {
            try {
                const parsedCategories = JSON.parse(storedCategories);
                categories = Array.isArray(parsedCategories) ? parsedCategories : [];
                console.log("admin-menu.js: Categories loaded:", categories);
            } catch (e) {
                console.error("admin-menu.js: Error parsing categories from Local Storage:", e);
                categories = [];
            }
        } else {
            console.log("admin-menu.js: No categories found in Local Storage. Initializing defaults.");
            // Initial default categories if nothing in Local Storage
            categories = [
                { id: 'main-dishes', name: 'Main Dishes', imageUrl: 'https://via.placeholder.com/60x60', itemCount: 0 },
                { id: 'drinks', name: 'Drinks', imageUrl: 'https://via.placeholder.com/60x60', itemCount: 0 },
                { id: 'desserts', name: 'Desserts', imageUrl: 'https://via.placeholder.com/60x60', itemCount: 0 }
            ];
        }

        // Ensure 'All Categories' category is always present at the beginning
        const allCategoriesId = 'all';
        const allCategoriesNameBase = 'All Categories';
        const allCategoriesImageUrl = 'https://via.placeholder.com/60x60';

        const allCategoriesExists = categories.some(cat => cat.id === allCategoriesId);

        if (!allCategoriesExists) {
            categories.unshift({ id: allCategoriesId, name: allCategoriesNameBase, imageUrl: allCategoriesImageUrl, itemCount: 0 });
        } else {
            const existingAllCategoriesIndex = categories.findIndex(cat => cat.id === allCategoriesId);
            if (existingAllCategoriesIndex !== 0) {
                const allCat = categories.splice(existingAllCategoriesIndex, 1)[0];
                categories.unshift(allCat);
            }
            categories[0].name = allCategoriesNameBase;
        }

        saveCategoriesToLocalStorage();
        console.log("admin-menu.js: Final categories state after load:", categories);
    }

    // Function to save categories to Local Storage
    function saveCategoriesToLocalStorage() {
        localStorage.setItem('categories', JSON.stringify(categories));
        console.log("admin-menu.js: Categories saved to Local Storage.");
    }

    // Function to render categories to the UI
    const itemListTitle = document.getElementById('itemListTitle');
    const categoryListContainer = document.querySelector('.category-list');

    function renderCategories() {
        console.log("admin-menu.js: Rendering categories...");
        if (!categoryListContainer) {
            console.error("admin-menu.js: categoryListContainer not found. Cannot render categories.");
            return;
        }

        categoryListContainer.innerHTML = ''; // Clear existing cards

        categories.forEach(category => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.dataset.id = category.id; // Store ID for selection

            // Determine the displayed name for the category card
            const displayedName = `${category.name}`; // Always show just the name in H3, count is below

            // The text for the count below the title should always be "Items"
            const countLabel = 'Items';

            card.innerHTML = `
                <img src="${category.imageUrl}" alt="${category.name}" class="category-image">
                <div class="category-info">
                    <h3 class="category-name">${displayedName}</h3>
                    <p class="category-items-count">${category.itemCount} ${countLabel}</p>
                </div>
                <div class="category-actions">
                    ${category.id !== 'all' ? `<i class="fas fa-edit edit-icon" data-id="${category.id}"></i>` : ''}
                    ${category.id !== 'all' ? `<i class="fas fa-trash-alt delete-icon" data-id="${category.id}" data-name="${category.name}"></i>` : ''}
                </div>
            `;

            // Add click listener for category selection
            card.addEventListener('click', (event) => {
                // Prevent category selection if an icon was clicked
                if (event.target.classList.contains('edit-icon') || event.target.classList.contains('delete-icon')) {
                    return;
                }

                // Remove active class from all other cards
                document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active-category'));
                card.classList.add('active-category');

                if (category.id === 'all') {
                    if (addItemBtn) addItemBtn.style.display = 'none'; // Hide add item button
                    if (itemListTitle) itemListTitle.textContent = 'All Items List';
                    activeCategoryIdForNewItem = null; // No specific category selected for new item
                    renderMenuItems('all'); // Render all items
                } else {
                    if (addItemBtn) addItemBtn.style.display = 'block'; // Show add item button
                    if (itemListTitle) itemListTitle.textContent = `${category.name} List`;
                    activeCategoryIdForNewItem = category.id; // Set active category for new item
                    renderMenuItems(category.id); // Render items for the selected category
                }
                console.log(`admin-menu.js: Active category changed to: ${category.name}. Update item list accordingly.`);
            });

            categoryListContainer.appendChild(card);
        });

        // Set 'All Categories' as active by default or the first item if 'All Categories' doesn't exist
        const allCategoriesCard = document.querySelector('.category-card[data-id="all"]');
        if (allCategoriesCard) {
            allCategoriesCard.classList.add('active-category');
            if (addItemBtn) addItemBtn.style.display = 'none'; // Hide add item button initially
            if (itemListTitle) {
                itemListTitle.textContent = 'All Items List';
            }
            console.log("admin-menu.js: Rendering all items initially from 'All Categories' card.");
            renderMenuItems('all'); // Load all items initially
        } else if (categories.length > 0) {
            // Fallback: If 'All Categories' is somehow not the first, make the first category active
            const firstCategoryCard = document.querySelector('.category-card');
            if (firstCategoryCard) {
                firstCategoryCard.classList.add('active-category');
                // Ensure the addItemBtn is visible if the first category is not 'all'
                if (firstCategoryCard.dataset.id !== 'all' && addItemBtn) {
                     addItemBtn.style.display = 'block';
                     activeCategoryIdForNewItem = firstCategoryCard.dataset.id;
                } else if (addItemBtn) {
                    addItemBtn.style.display = 'none';
                    activeCategoryIdForNewItem = null;
                }
                if (itemListTitle) {
                    itemListTitle.textContent = `${categories[0].name} List`;
                }
                console.log(`admin-menu.js: Rendering items for first category: ${categories[0].name}.`);
                renderMenuItems(categories[0].id);
            } else {
                console.warn("admin-menu.js: No category cards found despite categories array not being empty.");
                if (addItemBtn) addItemBtn.style.display = 'none';
                renderMenuItems('none'); // Render empty if no cards
            }
        } else {
            console.warn("admin-menu.js: No categories available to render. Rendering empty item list.");
            if (addItemBtn) addItemBtn.style.display = 'none';
            renderMenuItems('none'); // Render empty if no categories
        }
    }

    // Function to delete categories by name from Local Storage
    function deleteCategoriesFromLocalStorage(categoryNamesToDelete) {
        console.log(`admin-menu.js: Attempting to delete categories: ${categoryNamesToDelete.join(', ')}`);
        const initialLength = categories.length;
        // Filter out categories whose names are in the 'categoryNamesToDelete' array
        // Prevent deletion of the 'All Categories' category
        categories = categories.filter(category =>
            !categoryNamesToDelete.includes(category.name) && category.id !== 'all'
        );

        // Only save and re-render if something was actually deleted
        if (categories.length < initialLength) {
            saveCategoriesToLocalStorage();
            updateCategoryItemCounts(); // Update category counts and re-render categories
            console.log(`admin-menu.js: Categories ${categoryNamesToDelete.join(', ')} deleted from Local Storage.`);
        } else {
            console.log("admin-menu.js: No matching categories found for deletion or 'All Categories' attempted to be deleted.");
        }
    }

    // Function to set up the category modal for 'add' or 'edit' mode
    function setCategoryModalMode(mode, categoryData = null) {
        currentCategoryModalMode = mode;
        if (mode === 'add') {
            if (categoryModalTitle) categoryModalTitle.textContent = 'Add New Category';
            if (categoryModalSubmitButton) categoryModalSubmitButton.textContent = 'Add Category';
            if (categoryTitleInput) categoryTitleInput.value = '';
            if (categoryImageInput) categoryImageInput.value = ''; // Clear file input
            if (categoryImagePreview) categoryImagePreview.style.display = 'none';
            if (categoryImagePreview) categoryImagePreview.src = '#';
            editingCategoryId = null;
            console.log("admin-menu.js: Category modal set to 'add' mode.");
        } else if (mode === 'edit' && categoryData) {
            if (categoryModalTitle) categoryModalTitle.textContent = 'Edit Category';
            if (categoryModalSubmitButton) categoryModalSubmitButton.textContent = 'Update Category';
            if (categoryTitleInput) categoryTitleInput.value = categoryData.name;
            // Display current image for editing
            if (categoryImagePreview) {
                if (categoryData.imageUrl && categoryData.imageUrl !== 'https://via.placeholder.com/60x60') {
                    categoryImagePreview.src = categoryData.imageUrl;
                    categoryImagePreview.style.display = 'block';
                } else {
                    categoryImagePreview.style.display = 'none';
                    categoryImagePreview.src = '#';
                }
            }
            if (categoryImageInput) categoryImageInput.value = ''; // Clear file input (user has to re-select if they want to change it)
            editingCategoryId = categoryData.id;
            console.log(`admin-menu.js: Category modal set to 'edit' mode for ID: ${categoryData.id}`);
        }
    }

    // --- Event Delegation for Edit/Delete Icons (Categories) ---
    if (categoryListContainer) {
        categoryListContainer.addEventListener('click', (event) => {
            // Handle Delete Icon click
            if (event.target.classList.contains('delete-icon')) {
                const categoryNameToDelete = event.target.dataset.name;
                if (confirm(`Are you sure you want to delete the category '${categoryNameToDelete}'? This action cannot be undone.`)) {
                    // Also delete all items associated with this category
                    const categoryIdToDelete = event.target.dataset.id;
                    menuItems = menuItems.filter(item => item.categoryId !== categoryIdToDelete);
                    saveMenuItemsToLocalStorage(); // Save items after deleting associated ones
                    deleteCategoriesFromLocalStorage([categoryNameToDelete]); // Delete category itself
                }
            }
            // Handle Edit Icon click
            else if (event.target.classList.contains('edit-icon')) {
                const categoryIdToEdit = event.target.dataset.id;
                const categoryToEdit = categories.find(cat => cat.id === categoryIdToEdit);
                if (categoryToEdit) {
                    setCategoryModalMode('edit', categoryToEdit);
                    openModal(addCategoryModal);
                }
            }
        });
    }

    // --- Form Submission (Add/Edit Category) ---
    const addCategoryForm = document.getElementById('addCategoryForm');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission
            console.log("admin-menu.js: Add/Edit Category Form submitted.");

            const categoryTitle = categoryTitleInput?.value?.trim();
            if (!categoryTitle) {
                alert('Category title cannot be empty.');
                return;
            }

            const categoryImageFile = categoryImageInput?.files?.[0];

            // Function to process category data after image is read (if any)
            const processCategoryData = (imageUrlToSave) => {
                const newCategoryId = categoryTitle.toLowerCase().replace(/\s/g, '-');
                // Ensure the new category ID doesn't clash with 'all'
                if (newCategoryId === 'all') {
                    alert(`Category title "${categoryTitle}" is reserved. Please choose a different name.`);
                    return;
                }

                if (currentCategoryModalMode === 'add') {
                    const newCategory = {
                        id: newCategoryId,
                        name: categoryTitle,
                        imageUrl: imageUrlToSave || 'https://via.placeholder.com/60x60',
                        itemCount: 0
                    };
                    categories.push(newCategory);
                    alert(`Category "${categoryTitle}" added!`);
                    console.log(`admin-menu.js: New category added: ${categoryTitle}`);
                } else if (currentCategoryModalMode === 'edit' && editingCategoryId) {
                    const categoryIndex = categories.findIndex(cat => cat.id === editingCategoryId);
                    if (categoryIndex !== -1) {
                        const categoryToUpdate = categories[categoryIndex];
                        categoryToUpdate.name = categoryTitle;
                        if (imageUrlToSave) {
                            categoryToUpdate.imageUrl = imageUrlToSave;
                        } else if (categoryImageInput?.value === '') {
                            categoryToUpdate.imageUrl = 'https://via.placeholder.com/60x60';
                        }
                        alert(`Category "${categoryTitle}" updated!`);
                        console.log(`admin-menu.js: Category updated: ${categoryTitle}`);
                    }
                }

                saveCategoriesToLocalStorage();
                updateCategoryItemCounts(); // Re-calculate and re-render categories to update counts
                closeModal(addCategoryModal);
                addCategoryForm.reset();
                setCategoryModalMode('add');
            };

            if (categoryImageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    processCategoryData(e.target.result);
                };
                reader.readAsDataURL(categoryImageFile);
            } else {
                if (currentCategoryModalMode === 'edit' && editingCategoryId) {
                    const categoryToUpdate = categories.find(cat => cat.id === editingCategoryId);
                    processCategoryData(categoryToUpdate ? categoryToUpdate.imageUrl : null);
                } else {
                    processCategoryData(null);
                }
            }
        });
    }

    // Handle image preview for add/edit category form
    if (categoryImageInput) {
        categoryImageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (categoryImagePreview) {
                        categoryImagePreview.src = e.target.result;
                        categoryImagePreview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            } else {
                if (categoryImagePreview) {
                    categoryImagePreview.src = '#';
                    categoryImagePreview.style.display = 'none';
                }
            }
        });
    }

    // --- Item Data Management (Local Storage & Rendering) ---
    let menuItems = []; // This array will hold the current menu items

    // Load items from Local Storage
    function loadMenuItemsFromLocalStorage() {
        console.log("admin-menu.js: Loading menu items from Local Storage...");
        const storedItems = localStorage.getItem('menuItems');
        if (storedItems) {
            try {
                const parsedItems = JSON.parse(storedItems);
                menuItems = Array.isArray(parsedItems) ? parsedItems : [];
                console.log("admin-menu.js: Menu items loaded:", menuItems);
            } catch (e) {
                console.error("admin-menu.js: Error parsing menu items from Local Storage:", e);
                menuItems = [];
            }
        } else {
            console.log("admin-menu.js: No menu items found in Local Storage. Initializing defaults.");
            menuItems = [
                { id: 'item1', name: 'Jollof Rice', categoryId: 'main-dishes', categoryName: 'Main Dishes', size: 'Medium', price: 2500, prepTime: 30, imageUrl: 'https://via.placeholder.com/50', status: 'Available' },
                { id: 'item2', name: 'Chicken & Chips', categoryId: 'main-dishes', categoryName: 'Main Dishes', size: 'Large', price: 3500, prepTime: 25, imageUrl: 'https://via.placeholder.com/50', status: 'Unavailable' },
                { id: 'item3', name: 'Coca-Cola', categoryId: 'drinks', categoryName: 'Drinks', size: '35cl', price: 500, prepTime: 2, imageUrl: 'https://via.placeholder.com/50', status: 'Available' },
                { id: 'item4', name: 'Chocolate Cake', categoryId: 'desserts', categoryName: 'Desserts', size: 'Slice', price: 1200, prepTime: 10, imageUrl: 'https://via.placeholder.com/50', status: 'Available' }
            ];
            saveMenuItemsToLocalStorage();
        }
        console.log("admin-menu.js: Final menu items state after load:", menuItems);
    }

    // Save items to Local Storage
    function saveMenuItemsToLocalStorage() {
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
        console.log("admin-menu.js: Menu items saved to Local Storage.");
    }

    // Render menu items to the table
    const menuItemsTableBody = document.querySelector('.menu-items-table tbody');

    function renderMenuItems(categoryId = 'all') {
        console.log(`admin-menu.js: Rendering menu items for categoryId: ${categoryId}`);
        if (!menuItemsTableBody) {
            console.error("admin-menu.js: menuItemsTableBody not found. Cannot render menu items.");
            return;
        }

        menuItemsTableBody.innerHTML = ''; // Clear existing items

        const itemsToRender = categoryId === 'all' || categoryId === 'none'
            ? menuItems
            : menuItems.filter(item => item.categoryId === categoryId);

        if (itemsToRender.length === 0) {
            menuItemsTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No items found in this category.</td></tr>';
            console.log(`admin-menu.js: No items to render for categoryId: ${categoryId}`);
            return;
        }

        itemsToRender.forEach((item, index) => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.size || 'N/A'}</td>
                <td>₦${item.price ? item.price.toLocaleString() : '0'}</td>
                <td>${item.prepTime ? item.prepTime + ' min' : 'N/A'}</td>
                <td><img src="${item.imageUrl || 'https://via.placeholder.com/50'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                <td>${item.status || 'N/A'}</td>
                <td>
                    <i class="fas fa-edit edit-item-icon" data-id="${item.id}"></i>
                    <i class="fas fa-trash-alt delete-item-icon" data-id="${item.id}"></i>
                </td>
            `;
            menuItemsTableBody.appendChild(row);
        });
        console.log(`admin-menu.js: Rendered ${itemsToRender.length} items for categoryId: ${categoryId}`);
    }

    // Update item counts in categories and re-render categories
    function updateCategoryItemCounts() {
        console.log("admin-menu.js: Updating category item counts...");
        categories.forEach(category => {
            if (category.id === 'all') {
                category.itemCount = menuItems.length; // Total count of all items
            } else {
                category.itemCount = menuItems.filter(item => item.categoryId === category.id).length;
            }
        });
        saveCategoriesToLocalStorage();
        renderCategories(); // Re-render category list to show updated counts
        console.log("admin-menu.js: Category item counts updated.");
    }

    // --- Add/Edit Item Modal Logic ---
    let currentAddItemModalMode = 'add';
    let editingItemId = null;

    const addItemModalTitle = document.querySelector('#addItemModal h2');
    const addItemModalSubmitButton = document.getElementById('modalSubmitButton');
    const itemNameInput = document.getElementById('itemName');
    const itemSizeInput = document.getElementById('itemSize');
    const itemPriceInput = document.getElementById('itemPrice');
    const itemPrepTimeInput = document.getElementById('itemPrepTime');
    const itemStatusInput = document.getElementById('itemStatus');
    const itemImageInput = document.getElementById('itemImage');
    const itemImagePreview = document.getElementById('itemImagePreview');
    const addItemForm = document.getElementById('addItemForm');


    function setAddItemModalMode(mode, itemData = null) {
        currentAddItemModalMode = mode;
        if (mode === 'add') {
            if (addItemModalTitle) addItemModalTitle.textContent = 'Add New Item';
            if (addItemModalSubmitButton) addItemModalSubmitButton.textContent = 'Add Item';
            if (addItemForm) addItemForm.reset();
            if (itemImagePreview) itemImagePreview.style.display = 'none';
            if (itemImagePreview) itemImagePreview.src = '#';
            editingItemId = null;
            console.log("admin-menu.js: Add Item modal set to 'add' mode.");
        } else if (mode === 'edit' && itemData) {
            if (addItemModalTitle) addItemModalTitle.textContent = 'Edit Item';
            if (addItemModalSubmitButton) addItemModalSubmitButton.textContent = 'Update Item';
            if (itemNameInput) itemNameInput.value = itemData.name;
            if (itemSizeInput) itemSizeInput.value = itemData.size || '';
            if (itemPriceInput) itemPriceInput.value = itemData.price;
            if (itemPrepTimeInput) itemPrepTimeInput.value = itemData.prepTime || '';
            if (itemStatusInput) itemStatusInput.value = itemData.status;

            if (itemImagePreview) {
                if (itemData.imageUrl && itemData.imageUrl !== 'https://via.placeholder.com/50') {
                    itemImagePreview.src = itemData.imageUrl;
                    itemImagePreview.style.display = 'block';
                } else {
                    itemImagePreview.style.display = 'none';
                    itemImagePreview.src = '#';
                }
            }
            if (itemImageInput) itemImageInput.value = '';
            editingItemId = itemData.id;
            console.log(`admin-menu.js: Add Item modal set to 'edit' mode for ID: ${itemData.id}`);
        }
    }

    // Add/Edit Item Form Submission
    if (addItemForm) {
        addItemForm.addEventListener('submit', (event) => {
            event.preventDefault();
            console.log("admin-menu.js: Add/Edit Item Form submitted.");

            const name = itemNameInput?.value?.trim();
            const size = itemSizeInput?.value?.trim();
            const price = parseFloat(itemPriceInput?.value);
            const prepTime = parseInt(itemPrepTimeInput?.value);
            const status = itemStatusInput?.value;
            const imageFile = itemImageInput?.files?.[0];

            if (!name || isNaN(price) || isNaN(prepTime) || !status) {
                alert('Please fill in all required item fields correctly.');
                return;
            }
            if (price < 0 || prepTime < 0) {
                 alert('Price and preparation time cannot be negative.');
                 return;
            }

            const processItemSave = (imageUrlToSave) => {
                let categoryIdToUse;
                let categoryNameToUse;

                if (currentAddItemModalMode === 'add') {
                    // For new items, use the globally tracked active category ID
                    if (!activeCategoryIdForNewItem) {
                        alert("Error: No specific category selected for the new item. Please select a category before adding.");
                        closeModal(addItemModal);
                        return;
                    }
                    categoryIdToUse = activeCategoryIdForNewItem;
                    categoryNameToUse = categories.find(cat => cat.id === activeCategoryIdForNewItem)?.name;
                    if (!categoryNameToUse) {
                        console.error(`Category name not found for ID: ${activeCategoryIdForNewItem}`);
                        categoryNameToUse = 'Unknown Category'; // Fallback for display
                    }
                } else if (currentAddItemModalMode === 'edit' && editingItemId) {
                    // For existing items, retain their original category
                    const existingItem = menuItems.find(item => item.id === editingItemId);
                    categoryIdToUse = existingItem ? existingItem.categoryId : 'all'; // Default to 'all' if category somehow lost
                    categoryNameToUse = categories.find(cat => cat.id === categoryIdToUse)?.name || 'Unknown';
                } else {
                    // Fallback for unexpected modes (shouldn't happen)
                    categoryIdToUse = 'all';
                    categoryNameToUse = 'All Categories';
                }

                const itemData = {
                    id: editingItemId || 'item-' + Date.now(),
                    name: name,
                    categoryId: categoryIdToUse,
                    categoryName: categoryNameToUse,
                    size: size,
                    price: price,
                    prepTime: prepTime,
                    imageUrl: imageUrlToSave || 'https://via.placeholder.com/50',
                    status: status
                };

                if (currentAddItemModalMode === 'add') {
                    menuItems.push(itemData);
                    alert(`Item "${name}" added to category "${categoryNameToUse}"!`);
                    console.log(`admin-menu.js: New item added: ${name}`);
                } else if (currentAddItemModalMode === 'edit' && editingItemId) {
                    const itemIndex = menuItems.findIndex(item => item.id === editingItemId);
                    if (itemIndex !== -1) {
                        menuItems[itemIndex] = { ...menuItems[itemIndex], ...itemData };
                        alert(`Item "${name}" updated!`);
                        console.log(`admin-menu.js: Item updated: ${name}`);
                    }
                }
                saveMenuItemsToLocalStorage();
                renderMenuItems(document.querySelector('.category-card.active-category')?.dataset.id || 'all');
                updateCategoryItemCounts();
                closeModal(addItemModal);
                addItemForm.reset();
            };

            if (imageFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    processItemSave(e.target.result);
                };
                reader.readAsDataURL(imageFile);
            } else {
                if (currentAddItemModalMode === 'edit' && editingItemId) {
                    const existingItem = menuItems.find(item => item.id === editingItemId);
                    processItemSave(existingItem ? existingItem.imageUrl : null);
                } else {
                    processItemSave(null);
                }
            }
        });
    }

    // Handle image preview for add/edit item form
    if (itemImageInput) {
        itemImageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (itemImagePreview) {
                        itemImagePreview.src = e.target.result;
                        itemImagePreview.style.display = 'block';
                    }
                };
                reader.readAsDataURL(file);
            } else {
                if (itemImagePreview) {
                    itemImagePreview.src = '#';
                    itemImagePreview.style.display = 'none';
                }
            }
        });
    }


    // --- Event Delegation for Edit/Delete Icons (Items) ---
    if (menuItemsTableBody) {
        menuItemsTableBody.addEventListener('click', (event) => {
            // Handle Delete Item Icon click
            if (event.target.classList.contains('delete-item-icon')) {
                const itemIdToDelete = event.target.dataset.id;
                const itemToDelete = menuItems.find(item => item.id === itemIdToDelete);
                if (itemToDelete && confirm(`Are you sure you want to delete the item '${itemToDelete.name}'? This action cannot be undone.`)) {
                    menuItems = menuItems.filter(item => item.id !== itemIdToDelete);
                    saveMenuItemsToLocalStorage();
                    renderMenuItems(document.querySelector('.category-card.active-category')?.dataset.id || 'all');
                    updateCategoryItemCounts();
                    console.log(`admin-menu.js: Item deleted: ${itemToDelete.name}`);
                }
            }
            // Handle Edit Item Icon click
            else if (event.target.classList.contains('edit-item-icon')) {
                const itemIdToEdit = event.target.dataset.id;
                const itemToEdit = menuItems.find(item => item.id === itemIdToEdit);
                if (itemToEdit) {
                    setAddItemModalMode('edit', itemToEdit);
                    openModal(addItemModal);
                }
            }
        });
    }

    // --- Initial Load ---
    try {
        console.log("admin-menu.js: Initializing page components.");
        loadMenuItemsFromLocalStorage(); // Load items first to correctly count for categories
        loadCategoriesFromLocalStorage();
        updateCategoryItemCounts(); // Call this after both categories and items are loaded
        console.log("admin-menu.js: Page initialization complete.");
    } catch (error) {
        console.error("admin-menu.js: Initialization Error:", error);
        alert("An error occurred during page initialization. Please check the console for details.");
    }
});