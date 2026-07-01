(function(){
  'use strict';

  const CART_KEY = 'bensoft_cart';

  function loadCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch(e) { return []; }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateBadge();
  }

  function addItem(item) {
    const cart = loadCart();
    item.id = Date.now() + '-' + Math.random().toString(36).substr(2,6);
    item.addedAt = new Date().toISOString();
    cart.push(item);
    saveCart(cart);
    showAddedToast(item.productName);
  }

  function removeItem(id) {
    const cart = loadCart().filter(i => i.id !== id);
    saveCart(cart);
  }

  function updateItemQty(id, qty) {
    const cart = loadCart();
    const item = cart.find(i => i.id === id);
    if (item) { item.quantity = Math.max(1, qty); }
    saveCart(cart);
  }

  function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateBadge();
  }

  function getCart() { return loadCart(); }

  function getCartTotal() {
    return loadCart().reduce((sum, i) => sum + ((i.unitPrice || 0) * (i.quantity || 1)), 0);
  }

  function getCartCount() {
    return loadCart().length;
  }

  function updateBadge() {
    document.querySelectorAll('.cart-badge').forEach(el => {
      const count = getCartCount();
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function showAddedToast(name) {
    const existing = document.getElementById('cart-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'cart-toast';
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;background:#0d0d0d;color:#f5f0e8;padding:14px 22px;border-radius:4px;border-left:4px solid #e8420a;font-family:DM Sans,sans-serif;font-size:14px;box-shadow:0 8px 30px rgba(0,0,0,.25);display:flex;align-items:center;gap:10px;animation:cartSlideIn .3s ease;max-width:360px;';
    toast.innerHTML = '<span style="font-size:1.3rem;">&#9989;</span><span><strong>' + (name || 'Item') + '</strong> added to cart</span><a href="cart.html" style="font-family:Space Mono,monospace;font-size:.68rem;letter-spacing:1px;color:#e8420a;text-decoration:none;text-transform:uppercase;margin-left:8px;white-space:nowrap;">View Cart &#8594;</a>';
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3500);
  }

  function injectCartCSS() {
    if (document.getElementById('cart-badge-css')) return;
    const style = document.createElement('style');
    style.id = 'cart-badge-css';
    style.textContent = '.cart-nav-link{position:relative;display:inline-flex;align-items:center;gap:4px;}.cart-badge{position:absolute;top:-8px;right:-12px;min-width:18px;height:18px;background:#e8420a;color:#fff;font-family:Space Mono,monospace;font-size:10px;border-radius:50%;display:none;align-items:center;justify-content:center;padding:0 4px;line-height:1;}@keyframes cartSlideIn{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}';
    document.head.appendChild(style);
  }

  function injectCartLink() {
    injectCartCSS();
    const nav = document.querySelector('nav');
    if (!nav) return;
    if (document.querySelector('.cart-nav-link')) return;
    const link = document.createElement('a');
    link.href = 'cart.html';
    link.className = 'cart-nav-link';
    link.style.cssText = nav.querySelector('.back-link') ? 'font-family:Space Mono,monospace;font-size:.72rem;color:#888;text-decoration:none;letter-spacing:1px;text-transform:uppercase;transition:color .2s;' : '';
    link.innerHTML = '&#128722; Cart<span class="cart-badge">0</span>';
    link.onmouseover = function(){ this.style.color = '#e8420a'; };
    link.onmouseout = function(){ this.style.color = '#888'; };
    nav.appendChild(link);
    updateBadge();
  }

  async function submitOrder(formSpreeId, customerData, cartItems, paymentMethod, totalAmount) {
    const lines = cartItems.map((item, idx) => {
      let line = `\n--- ORDER ITEM #${idx + 1} ---\n`;
      line += `Product: ${item.productName}\n`;
      if (item.variant) line += `Variant: ${item.variant}\n`;
      if (item.size) line += `Size: ${item.size}\n`;
      if (item.colour) line += `Colour: ${item.colour}\n`;
      if (item.material) line += `Material: ${item.material}\n`;
      if (item.details) line += `Details: ${item.details}\n`;
      line += `Quantity: ${item.quantity}\n`;
      line += `Unit Price: KSh ${item.unitPrice}\n`;
      line += `Subtotal: KSh ${item.unitPrice * item.quantity}\n`;
      return line;
    }).join('\n');

    const data = {
      _subject: `New Order - ${paymentMethod} - KSh ${totalAmount.toLocaleString()}`,
      customer_name: customerData.name,
      phone: customerData.phone,
      email: customerData.email || 'N/A',
      payment_method: paymentMethod,
      total_amount: 'KSh ' + totalAmount.toLocaleString(),
      number_of_items: cartItems.length,
      order_items: lines,
      notes: customerData.notes || 'None',
    };

    try {
      const resp = await fetch('https://formspree.io/f/' + formSpreeId, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      return resp.ok;
    } catch(e) {
      return false;
    }
  }

  async function checkout(formSpreeId, customerData, paymentMethod = 'M-Pesa') {
    const cartItems = getCart();
    if (cartItems.length === 0) return { success: false, error: 'Cart is empty' };

    const totalAmount = getCartTotal();

    // Map product names to inventory product IDs
    const productIdMap = {
      't-shirt': 'tshirt',
      'tshirt': 'tshirt',
      'hoodie': 'hoodie',
      'polo shirt': 'polo',
      'polo': 'polo',
      'cap': 'cap',
      'mug': 'mug',
      'notebook': 'notebook',
      'sticker pack': 'sticker',
      'sticker': 'sticker',
      'lanyard': 'lanyard',
      'wristband': 'wristband',
      'umbrella': 'umbrella',
      'custom pillow': 'pillow',
      'pillow': 'pillow',
      'dustcoat': 'dustcoat',
      'sports jersey': 'jersey',
      'jersey': 'jersey',
      'reflector jacket': 'reflector',
      'reflector': 'reflector',
      'business cards': 'business-card',
      'banner': 'banner',
      'poster': 'poster',
      'id card': 'id-card',
      'wedding card': 'wedding-card',
      'decal': 'decal',
    };

    const orderItems = cartItems.map(item => {
      const key = (item.productName || '').toLowerCase().replace(/\s+/g, '-');
      return {
        productId: productIdMap[key] || key,
        color: item.colour || item.color || 'Default',
        size: item.size || 'Default',
        material: item.material || 'Default',
        quantity: item.quantity
      };
    });

    // Decrement stock via backend API
    try {
      const stockResp = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: orderItems })
      });
      const stockResult = await stockResp.json();
      if (!stockResult.success) {
        return { success: false, error: 'Stock error: ' + JSON.stringify(stockResult.errors) };
      }
    } catch (e) {
      return { success: false, error: 'Failed to reserve stock: ' + e.message };
    }

    // Submit to formspree
    const formspreeOk = await submitOrder(formSpreeId, customerData, cartItems, paymentMethod, totalAmount);
    if (!formspreeOk) return { success: false, error: 'Order submission failed' };

    clearCart();
    return { success: true };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCartLink);
  } else {
    injectCartLink();
  }

  window.BensoftCart = {
    add: addItem,
    remove: removeItem,
    updateQty: updateItemQty,
    clear: clearCart,
    get: getCart,
    getTotal: getCartTotal,
    getCount: getCartCount,
    updateBadge: updateBadge,
    submitOrder: submitOrder,
    checkout: checkout,
  };
})();
