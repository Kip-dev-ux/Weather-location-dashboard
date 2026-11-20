// Load saved inventory from localStorage or initialize empty array
let inventory = JSON.parse(localStorage.getItem('nexus_inventory')) || [];

const form = document.getElementById('product-form');
const tbody = document.getElementById('inventory-body');
const searchInput = document.getElementById('search-input');

// Save state and re-render UI
function syncState() {
  localStorage.setItem('nexus_inventory', JSON.stringify(inventory));
  renderInventory(searchInput.value);
  updateKPIs();
}

// Add or restock product by SKU
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const sku = document.getElementById('sku').value.trim().toUpperCase();
  const name = document.getElementById('name').value.trim();
  const cost = parseFloat(document.getElementById('cost').value);
  const price = parseFloat(document.getElementById('price').value);
  const stock = parseInt(document.getElementById('stock').value);

  // Check if SKU already exists to restock instead of duplicating
  const existing = inventory.find((item) => item.sku === sku);
  if (existing) {
    existing.stock += stock;
    existing.cost = cost;
    existing.price = price;
  } else {
    inventory.push({ sku, name, cost, price, stock });
  }

  form.reset();
  syncState();
});

// Render table rows
function renderInventory(filter = '') {
  tbody.innerHTML = '';
  const query = filter.toLowerCase();

  const filtered = inventory.filter(
    (item) => item.name.toLowerCase().includes(query) || item.sku.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:#64748b;">No products found. Add items above.</td></tr>';
    return;
  }

  filtered.forEach((item) => {
    const margin = item.price - item.cost;
    const stockClass = item.stock < 5 ? 'stock-low' : 'stock-ok';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${item.sku}</strong></td>
      <td>${item.name}</td>
      <td>KES ${item.cost}</td>
      <td>KES ${item.price}</td>
      <td>+KES ${margin}</td>
      <td class="${stockClass}">${item.stock} units</td>
      <td><button class="btn-del" onclick="deleteProduct('${item.sku}')">Remove</button></td>
    `;
    tbody.appendChild(tr);
  });
}

// Delete item
function deleteProduct(sku) {
  inventory = inventory.filter((item) => item.sku !== sku);
  syncState();
}

// Calculate KPI Dashboard
function updateKPIs() {
  const totalUnits = inventory.reduce((sum, item) => sum + item.stock, 0);
  const totalCostValue = inventory.reduce((sum, item) => sum + item.cost * item.stock, 0);
  const lowStockCount = inventory.filter((item) => item.stock < 5).length;

  document.getElementById('kpi-units').innerText = totalUnits;
  document.getElementById('kpi-value').innerText = `KES ${totalCostValue.toLocaleString()}`;
  document.getElementById('kpi-low').innerText = lowStockCount;
}

// Live search listener
searchInput.addEventListener('input', (e) => renderInventory(e.target.value));

// Initial render on page load
syncState();
