// Inventory Check Module - Include in any order page
// Usage: <script src="/inventory-check.js"></script>
// Then call: InventoryCheck.init({ productId: 'tshirt', color: 'White', size: 'M', material: 'Cotton', selector: '#stock-status' })
// Or for general product stock: InventoryCheck.init({ productId: 'tshirt', selector: '#stock-status' })

const InventoryCheck = (function() {
  const API_BASE = '/api';
  const POLL_INTERVAL = 30000;
  let pollTimer = null;
  let currentConfig = null;

  function createStatusElement(item, isVariant = false) {
    const badge = document.createElement('span');
    badge.className = 'stock-badge ' + (item.inStock ? 'in-stock' : 'out-of-stock');
    
    let label = '';
    if (isVariant) {
      const parts = [];
      if (item.color) parts.push(item.color);
      if (item.size) parts.push(item.size);
      if (item.material) parts.push(item.material);
      label = parts.join(' / ') + ': ';
    }
    
    badge.innerHTML = item.inStock 
      ? `<span class="stock-dot"></span> ${label}In Stock (${item.stock} left)`
      : `<span class="stock-dot"></span> ${label}Out of Stock`;
    badge.dataset.variantId = item.id || '';
    return badge;
  }

  function updateElement(selector, item, isVariant = false) {
    const el = document.querySelector(selector);
    if (!el) return;
    
    const existing = el.querySelector('.stock-badge');
    if (existing) existing.remove();
    
    el.appendChild(createStatusElement(item, isVariant));
  }

  async function fetchProductStock(productId) {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}`);
      if (!res.ok) throw new Error('Not found');
      return await res.json();
    } catch (e) {
      console.warn(`Inventory check failed for ${productId}:`, e.message);
      return null;
    }
  }

  async function fetchVariantStock(productId, color, size, material) {
    try {
      const res = await fetch(`${API_BASE}/products/${productId}/variants`);
      if (!res.ok) throw new Error('Not found');
      const variants = await res.json();
      return variants.find(v => v.color === color && v.size === size && v.material === material) || null;
    } catch (e) {
      console.warn(`Variant check failed:`, e.message);
      return null;
    }
  }

  async function checkAndUpdate(config) {
    const { productId, color, size, material, selector } = config;
    let item = null;
    let isVariant = false;
    
    if (color && size && material) {
      item = await fetchVariantStock(productId, color, size, material);
      isVariant = true;
    } else {
      item = await fetchProductStock(productId);
    }
    
    if (item) updateElement(selector, item, isVariant);
    return item;
  }

  function startPolling(config) {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => checkAndUpdate(config), POLL_INTERVAL);
  }

  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = null;
  }

  function init(config) {
    currentConfig = {
      productId: config.productId,
      color: config.color || null,
      size: config.size || null,
      material: config.material || null,
      selector: config.selector || '#stock-status'
    };
    
    let container = document.querySelector(currentConfig.selector);
    if (!container) {
      container = document.createElement('div');
      container.id = currentConfig.selector.replace('#', '');
      document.body.appendChild(container);
    }

    checkAndUpdate(currentConfig);
    startPolling(currentConfig);

    window.InventoryCheck = { 
      refresh: () => checkAndUpdate(currentConfig), 
      stop: stopPolling,
      updateConfig: (newConfig) => {
        currentConfig = { ...currentConfig, ...newConfig };
        checkAndUpdate(currentConfig);
      }
    };
  }

  // Auto-init from data attributes
  document.addEventListener('DOMContentLoaded', () => {
    const autoEls = document.querySelectorAll('[data-inventory-product]');
    autoEls.forEach(el => {
      const config = {
        productId: el.dataset.inventoryProduct,
        color: el.dataset.inventoryColor || null,
        size: el.dataset.inventorySize || null,
        material: el.dataset.inventoryMaterial || null,
        selector: '#' + el.id
      };
      init(config);
    });
  });

  return { init, checkAndUpdate, stopPolling };
})();

// CSS for stock badges (inject if not present)
if (!document.getElementById('inventory-check-styles')) {
  const style = document.createElement('style');
  style.id = 'inventory-check-styles';
  style.textContent = `
    .stock-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .stock-badge .stock-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .stock-badge.in-stock { background: #dcfce7; color: #166534; }
    .stock-badge.in-stock .stock-dot { background: #22c55e; }
    .stock-badge.out-of-stock { background: #fee2e2; color: #991b1b; }
    .stock-badge.out-of-stock .stock-dot { background: #ef4444; }
    #stock-status { margin: 10px 0; display: inline-block; }
  `;
  document.head.appendChild(style);
}