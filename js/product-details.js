// product-details.js (enhanced modal with cross-category selection + totals)
document.addEventListener("DOMContentLoaded", () => {
	// --- DOM ELEMENTS ---
	const qs = new URLSearchParams(window.location.search);
	const itemId =
		qs.get("id") || sessionStorage.getItem("selectedProductId") || null;

	const categoryTitleEl = document.getElementById("productCategoryTitle");
	const prepTimeEl = document.getElementById("productPrepTime");
	const selectedWrap = document.getElementById("productSelected");
	const relatedList = document.getElementById("productRelatedList");

	// Modal elements
	const modal = document.getElementById("addToOrderModal");
	const modalClose = document.getElementById("modalCloseBtn");
	const modalImg = document.getElementById("modalProductImg");
	const modalName = document.getElementById("modalProductName");
	const modalSelectedSizes = document.getElementById("modalSelectedSizes");
	const modalCategories = document.getElementById("modalCategories");
	const modalCartList = document.getElementById("modalCartList");
	const modalCartEmpty = document.getElementById("modalCartEmpty");
	const modalPayBtn = document.getElementById("modalPayBtn");
	const toast = document.getElementById("toast");

	// Data
	let menuItems = [];
	let categories = [];
	// temporary cart for modal session (not saved to localStorage until you choose to)
	let modalCart = [];

	// --- UTILITIES ---
	function loadMenuItems() {
		try {
			const raw = localStorage.getItem("menuItems");
			const items = raw ? JSON.parse(raw) : [];
			// migrate if needed (ensure sizes array)
			return items.map((i) => {
				if (!i.sizes || !Array.isArray(i.sizes) || i.sizes.length === 0) {
					const price = typeof i.price === "number" ? i.price : 0;
					return { ...i, sizes: [{ size: "Default", price }] };
				}
				return i;
			});
		} catch (e) {
			console.error("product-details.js: Failed to parse menuItems", e);
			return [];
		}
	}

	function loadCategories() {
		try {
			const raw = localStorage.getItem("categories");
			return raw ? JSON.parse(raw) : [];
		} catch (e) {
			console.error("product-details.js: Failed to parse categories", e);
			return [];
		}
	}

	function formatNaira(n) {
		return `₦${Number(n || 0).toLocaleString("en-NG")}`;
	}

	// compute total from modalCart
	function computeModalTotal() {
		return modalCart.reduce(
			(sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0),
			0
		);
	}

	function updatePayButton() {
		const total = computeModalTotal();
		modalPayBtn.textContent = `Pay ${formatNaira(total)}`;
	}

	function showToastMessage(msg) {
		toast.textContent = msg;
		toast.classList.remove("hidden");
		toast.classList.add("show");
		setTimeout(() => {
			toast.classList.remove("show");
			setTimeout(() => toast.classList.add("hidden"), 400);
		}, 1800);
	}

	// --- load data into memory ---
	menuItems = loadMenuItems();
	categories = loadCategories();

	const getCategoryName = (catId, fallback) =>
		categories.find((c) => c.id === catId)?.name || fallback || "Category";

	const getStockText = (status) => {
		if (!status) return "";
		if (/items?\s*left/i.test(status)) return status;
		if (/unavailable/i.test(status)) return "Sold out";
		return "";
	};

	// --- Back button (same as before) ---
	const backBtn = document.getElementById("productBackBtn");
	if (backBtn) {
		backBtn.addEventListener("click", () => {
			if (document.referrer) history.back();
			else window.location.href = "homepage.html";
		});
	}

	// --- find current item ---
	const currentItem = menuItems.find((i) => i.id === itemId) || menuItems[0];
	if (!currentItem) {
		selectedWrap.innerHTML = `<div class="product-item"><p>Item not found.</p></div>`;
		return;
	}

	const catName = getCategoryName(
		currentItem.categoryId,
		currentItem.categoryName
	);
	if (categoryTitleEl) categoryTitleEl.textContent = catName;
	if (prepTimeEl)
		prepTimeEl.textContent = currentItem.prepTime
			? `${currentItem.prepTime} mins`
			: "—";

	// --- render product row (same markup as before) ---
	function renderProductRow(item, isSelected = false) {
		const stockTxt = getStockText(item.status);
		const hasStockNote = stockTxt && stockTxt.length > 0;
		const sizesHtml = (item.sizes || [])
			.map(
				(s) => `
      <div class="product-size-row">
        <div class="product-size-pill">${s.size}</div>
        <div class="product-price-tag">${formatNaira(s.price)}</div>
      </div>`
			)
			.join("");
		const imgBg = item.imageUrl
			? `style="background-image:url('${item.imageUrl}');"`
			: "";

		const row = document.createElement("article");
		row.className = "product-item";
		row.innerHTML = `
      <div class="product-item-left">
        <div>
          <h3 class="product-item-title">${item.name}</h3>
          <div class="product-item-subtitle">
            <span>1 Plate of ${catName}</span>
            ${
							hasStockNote
								? `<span class="product-stock">${stockTxt}</span>`
								: ""
						}
          </div>
        </div>
        ${sizesHtml}
      </div>
      <div class="product-item-right">
        <div class="product-item-thumb" ${imgBg}></div>
        <button class="product-add-btn" data-id="${item.id}">Add+</button>
      </div>
    `;

		if (!isSelected) {
			row.querySelector(".product-item-title").addEventListener("click", () => {
				window.location.href = `product-details.html?id=${encodeURIComponent(
					item.id
				)}`;
			});
			row.querySelector(".product-item-thumb").addEventListener("click", () => {
				window.location.href = `product-details.html?id=${encodeURIComponent(
					item.id
				)}`;
			});
		}

		// open modal when Add+ clicked
		row.querySelector(".product-add-btn").addEventListener("click", () => {
			openModal(item);
		});

		return row;
	}

	// --- populate selected + related ---
	selectedWrap.innerHTML = "";
	selectedWrap.appendChild(renderProductRow(currentItem, true));

	const related = menuItems.filter(
		(i) => i.categoryId === currentItem.categoryId && i.id !== currentItem.id
	);
	relatedList.innerHTML = "";
	if (related.length === 0) {
		relatedList.innerHTML = `<div class="product-item"><p>No other items in this category.</p></div>`;
	} else {
		related.forEach((i) => relatedList.appendChild(renderProductRow(i, false)));
	}

	// --- modal cart helpers ---
	function findModalCartIndex(itemId, sizeLabel) {
		return modalCart.findIndex(
			(it) => it.id === itemId && it.size === sizeLabel
		);
	}

	function addItemToModalCart(itemObj, sizeObj) {
		const idx = findModalCartIndex(itemObj.id, sizeObj.size);
		if (idx > -1) {
			modalCart[idx].quantity += 1;
		} else {
			modalCart.push({
				id: itemObj.id,
				name: itemObj.name,
				size: sizeObj.size,
				price: sizeObj.price,
				imageUrl: itemObj.imageUrl,
				quantity: 1,
				categoryId: itemObj.categoryId,
			});
		}
		renderModalCart();
		updatePayButton();
		showToastMessage("Added to order preview");
	}

	function removeItemFromModalCart(index) {
		if (index > -1 && index < modalCart.length) {
			modalCart.splice(index, 1);
			renderModalCart();
			updatePayButton();
		}
	}

	function setItemQuantity(index, qty) {
		if (index >= 0 && index < modalCart.length) {
			modalCart[index].quantity = Math.max(0, Number(qty));
			if (modalCart[index].quantity === 0) {
				// remove item if 0
				modalCart.splice(index, 1);
			}
			renderModalCart();
			updatePayButton();
		}
	}

	// render the cart preview inside modal
	function renderModalCart() {
		modalCartList.innerHTML = "";
		if (!modalCart || modalCart.length === 0) {
			modalCartList.appendChild(modalCartEmpty);
			modalCartEmpty.style.display = "block";
			return;
		}
		modalCartEmpty.style.display = "none";

		modalCart.forEach((it, idx) => {
			const row = document.createElement("div");
			row.className = "modal-cart-row";
			row.innerHTML = `
        <div class="cart-item-left">
          <img src="${it.imageUrl || "https://via.placeholder.com/50"}" alt="${
				it.name
			}" style="width:44px;height:44px;border-radius:6px;object-fit:cover;"/>
          <div>
            <div class="cart-item-name">${it.name}</div>
            <div class="cart-item-size">${it.size} • ${formatNaira(
				it.price
			)}</div>
          </div>
        </div>
        <div class="cart-item-right">
          <div class="qty-stepper" data-idx="${idx}">
            <button class="qty-decrease" aria-label="decrease">−</button>
            <div class="qty-value">${it.quantity}</div>
            <button class="qty-increase" aria-label="increase">+</button>
          </div>
          <div style="min-width:7rem; text-align:right; font-weight:700; margin-left:.6rem;">${formatNaira(
						it.price * it.quantity
					)}</div>
          <button class="cart-remove-btn" data-idx="${idx}" title="Remove">✕</button>
        </div>
      `;
			modalCartList.appendChild(row);
		});

		// attach listeners for steppers & remove
		modalCartList.querySelectorAll(".qty-stepper").forEach((step) => {
			const idx = Number(step.dataset.idx);
			step.querySelector(".qty-decrease").addEventListener("click", () => {
				setItemQuantity(idx, modalCart[idx].quantity - 1);
			});
			step.querySelector(".qty-increase").addEventListener("click", () => {
				setItemQuantity(idx, modalCart[idx].quantity + 1);
			});
		});

		modalCartList.querySelectorAll(".cart-remove-btn").forEach((btn) => {
			btn.addEventListener("click", (e) => {
				const idx = Number(e.currentTarget.dataset.idx);
				removeItemFromModalCart(idx);
			});
		});
	}

	// --- categories accordion rendering inside modal ---
	function renderModalCategories() {
		modalCategories.innerHTML = "";
		// group items by category id (use categories array for ordering)
		const byCategory = {};
		menuItems.forEach((it) => {
			if (!byCategory[it.categoryId]) byCategory[it.categoryId] = [];
			byCategory[it.categoryId].push(it);
		});

		// for each category in categories array, render a block (skip those with no items)
		const visibleCategories = categories.length
			? categories
			: Object.keys(byCategory).map((id) => ({ id, name: id }));
		visibleCategories.forEach((cat) => {
			const itemsForCat = byCategory[cat.id] || [];
			if (itemsForCat.length === 0) return;
			const catWrap = document.createElement("div");
			catWrap.className = "modal-category";
			catWrap.innerHTML = `
        <div class="modal-category-header" role="button" data-cat="${cat.id}">
          <div class="modal-category-title">${cat.name}</div>
          <div class="modal-category-count">${itemsForCat.length}</div>
        </div>
        <div class="modal-category-items" data-cat-items="${cat.id}"></div>
      `;
			modalCategories.appendChild(catWrap);

			const itemsEl = catWrap.querySelector(".modal-category-items");
			itemsForCat.forEach((item) => {
				// don't hide the currentItem; it's okay to show everything
				// But show each item's sizes inline with an Add button for each size
				const itemRow = document.createElement("div");
				itemRow.className = "modal-category-item";
				itemRow.innerHTML = `
          <div class="item-left">
            <img src="${
							item.imageUrl || "https://via.placeholder.com/50"
						}" alt="${item.name}">
            <div>
              <div style="font-weight:600;">${item.name}</div>
              <div style="font-size:.85rem;color:#666;">${
								item.sizes && item.sizes.length
									? item.sizes
											.map((s) => s.size + ": " + formatNaira(s.price))
											.join(" • ")
									: ""
							}</div>
            </div>
          </div>
          <div class="item-right" style="display:flex; align-items:center; gap:.5rem;">
            <button class="modal-item-add-btn" data-id="${
							item.id
						}">+ Add</button>
          </div>
        `;
				itemsEl.appendChild(itemRow);
			});
		});

		// attach toggles to accordion headers
		modalCategories.querySelectorAll(".modal-category-header").forEach((h) => {
			h.addEventListener("click", () => {
				const catId = h.dataset.cat;
				const container = modalCategories.querySelector(
					`.modal-category-items[data-cat-items="${catId}"]`
				);
				if (!container) return;
				container.classList.toggle("open");
			});
		});

		// attach handlers for Add buttons (for items in category lists)
		modalCategories.querySelectorAll(".modal-item-add-btn").forEach((btn) => {
			btn.addEventListener("click", (e) => {
				const id = e.currentTarget.dataset.id;
				const itemObj = menuItems.find((x) => x.id === id);
				if (!itemObj) return;
				// if item has multiple sizes, we add the first size by default (user can adjust qty later)
				const sizeObj =
					itemObj.sizes && itemObj.sizes[0]
						? itemObj.sizes[0]
						: { size: "Default", price: 0 };
				addItemToModalCart(itemObj, sizeObj);
			});
		});
	}

	// --- Selected product size list (at top of modal) ---
	function renderSelectedSizes(item) {
		modalSelectedSizes.innerHTML = "";
		if (!item || !item.sizes) return;
		item.sizes.forEach((s, i) => {
			const div = document.createElement("div");
			div.style.display = "flex";
			div.style.justifyContent = "space-between";
			div.style.alignItems = "center";
			div.style.padding = ".4rem 0";
			div.innerHTML = `
        <div style="font-weight:600;">${s.size}</div>
        <div style="display:flex; align-items:center; gap:.6rem;">
          <div style="font-weight:700;">${formatNaira(s.price)}</div>
          <button class="modal-add-size-btn" data-idx="${i}" style="padding:.4rem .6rem; border-radius:.6rem; background:#0f1a2b; color:#fff; border:none; cursor:pointer;">Add</button>
        </div>
      `;
			modalSelectedSizes.appendChild(div);
		});

		// attach add buttons for sizes
		modalSelectedSizes.querySelectorAll(".modal-add-size-btn").forEach((b) => {
			b.addEventListener("click", (e) => {
				const idx = Number(e.currentTarget.dataset.idx);
				const size = item.sizes[idx];
				if (!size) return;
				addItemToModalCart(item, size);
			});
		});
	}

	// --- open modal (populate selected product, categories and current modalCart) ---
	function openModal(item) {
		// reset modal cart only if you want; here we keep existing modalCart for the session
		modalName.textContent = item.name;
		modalImg.src = item.imageUrl || "";
		renderSelectedSizes(item);
		renderModalCategories();
		renderModalCart();
		updatePayButton();
		modal.classList.remove("hidden");
		modal.setAttribute("aria-hidden", "false");
	}

	modalClose.addEventListener("click", () => {
		modal.classList.add("hidden");
		modal.setAttribute("aria-hidden", "true");
	});

	// clicking outside the modal-content should close modal
	modal.addEventListener("click", (e) => {
		if (e.target === modal) {
			modal.classList.add("hidden");
			modal.setAttribute("aria-hidden", "true");
		}
	});

	// Pay button - just calculate and show toast (no save)
	modalPayBtn.addEventListener("click", () => {
		const total = computeModalTotal();
		showToastMessage(`Proceeding to payment — ${formatNaira(total)}`);
	});

	// ensure modal is initially hidden
	modal.classList.add("hidden");

	// --- Auto-open modal when navigated from confirm-order (edit selection) ---
	try {
		const shouldOpen = sessionStorage.getItem("openAddModal");
		const editPayload = sessionStorage.getItem("cartEditItem"); // JSON string of modalCart array (optional)
		if (editPayload) {
			try {
				// Fill modalCart with the passed item(s)
				modalCart = Array.isArray(JSON.parse(editPayload))
					? JSON.parse(editPayload)
					: [];
				// remove saved payload so it doesn't persist
				sessionStorage.removeItem("cartEditItem");
			} catch (e) {
				console.warn(
					"product-details.js: failed to parse cartEditItem payload",
					e
				);
			}
		}
		if (shouldOpen === "true") {
			// clear flag and open modal for the current item
			sessionStorage.removeItem("openAddModal");
			// if currentItem corresponds to requested selectedProductId it was already picked earlier,
			// so call openModal(currentItem) to show the overlay.
			if (currentItem) {
				openModal(currentItem);
			}
		}
	} catch (e) {
		console.warn("product-details.js: auto-open check failed", e);
	}

	// End of DOMContentLoaded
});

document.addEventListener("click", (event) => {
	if (event.target && event.target.id === "modalPayBtn") {
		const cart = JSON.parse(localStorage.getItem("cart")) || [];
		localStorage.setItem("cart", JSON.stringify(cart));
		window.location.href = "confirm-order.html";
	}
});
