// confirm-order.js
document.addEventListener('DOMContentLoaded', () => {
  const selectionsList = document.getElementById('selectionsList');
  const orderTotalEl = document.getElementById('orderTotal');
  const addAnotherPackBtn = document.getElementById('addAnotherPack');
  const selectLocationBtn = document.getElementById('selectLocationBtn');
  const editSelectionsRow = document.getElementById('editSelectionsRow');
  const confirmBackBtn = document.getElementById('confirmBackBtn');

  // Read cart from localStorage (expects array)
  function loadCart() {
    try {
      const raw = localStorage.getItem('cart');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('confirm-order.js: Failed to parse cart', e);
      return [];
    }
  }

  function formatNaira(n) {
    return `₦${Number(n || 0).toLocaleString('en-NG')}`;
  }

  function computeTotal(cart) {
    return cart.reduce((sum, it) => sum + (Number(it.price || 0) * Number(it.quantity || 0)), 0);
  }

  function renderSelections() {
    const cart = loadCart();
    selectionsList.innerHTML = '';

    if (!cart || cart.length === 0) {
      selectionsList.innerHTML = `<div style="color:#666; padding:.8rem 0;">No items in your order yet.</div>`;
      orderTotalEl.textContent = formatNaira(0);
      return;
    }

    // For visual parity with the mock, group by "pack" if needed.
    // Here we simply list items sequentially (you can adjust grouping later).
    cart.forEach((it, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'selection-row';
      wrapper.innerHTML = `
        <div style="flex:1;">
          <div class="selection-left">
            ${it.quantity ? `${it.quantity} x ` : ''}<strong style="color:var(--text-light);">${it.name}</strong>
            <div style="margin-top:.4rem; color:#999; font-size:1.3rem;">${it.size ? it.size : ''}${it.extras ? ' • ' + it.extras : ''}</div>
          </div>
        </div>
        <div>
          <img src="${it.imageUrl || 'https://via.placeholder.com/80'}" alt="${it.name}" class="selection-thumb" />
        </div>
      `;
      selectionsList.appendChild(wrapper);
    });

    // update total
    const total = computeTotal(cart);
    orderTotalEl.textContent = formatNaira(total);
  }

  // When user clicks Edit Selections: open product-details overlay for the first item (or let user pick)
  // Strategy:
  //  - Save selected item's id to sessionStorage.selectedProductId
  //  - Save the cart item we want to edit as sessionStorage.cartEditItem (JSON string)
  //  - Set sessionStorage.openAddModal = "true" so product-details.js will auto-open modal on load
  //  - Navigate to product-details.html
  editSelectionsRow.addEventListener('click', () => {
    const cart = loadCart();
    if (!cart || cart.length === 0) return;
    // For this implementation, open the *first* cart item for editing.
    // Optionally you can change to show a picker to choose which pack to edit.
    const itemToEdit = cart[0]; // or let user choose by UI later
    if (!itemToEdit || !itemToEdit.id) return;

    sessionStorage.setItem('selectedProductId', itemToEdit.id);
    sessionStorage.setItem('cartEditItem', JSON.stringify([ itemToEdit ])); // product-details expects modalCart array
    sessionStorage.setItem('openAddModal', 'true');

    // navigate back to product-details page (it will open the modal)
    window.location.href = `product-details.html?id=${encodeURIComponent(itemToEdit.id)}`;
  });

  // Add another pack -> go to homepage or product listing
  addAnotherPackBtn.addEventListener('click', () => {
    // your product listing could be homepage.html or products.html; we use homepage.html as earlier
    window.location.href = 'homepage.html';
  });

  // Select location (placeholder)
  selectLocationBtn.addEventListener('click', () => {
    // Placeholder — implement real flow later
    alert('Select Location — next step (placeholder).');
    // Example: window.location.href = 'select-location.html';
  });

  // Back button
  confirmBackBtn.addEventListener('click', () => {
    window.history.back();
  });

  // initial render
  renderSelections();
});
