const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bodyParser = require('body-parser');
const path = require('path');
const {
  initDB,
  getProducts,
  getProduct,
  getVariants,
  getVariant,
  getVariantByProductAndOptions,
  getAllVariantsWithProducts,
  getTotalStock,
  addProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariantStock,
  decrementVariantStock,
  updateVariant,
  deleteVariant,
  getProductConfig,
  getAllProductConfigs
} = require('./models/inventory');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

initDB();

// Product endpoints
app.get('/api/products', (req, res) => {
  const products = getProducts();
  const productsWithStock = products.map(p => ({
    ...p,
    totalStock: getTotalStock(p.id),
    inStock: getTotalStock(p.id) > 0
  }));
  res.json(productsWithStock);
});

app.get('/api/products/:id', (req, res) => {
  const product = getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  product.totalStock = getTotalStock(product.id);
  product.inStock = product.totalStock > 0;
  product.config = getProductConfig(product.id);
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const { id, name, category } = req.body;
  if (!id || !name || !category) {
    return res.status(400).json({ error: 'id, name, and category are required' });
  }
  const product = addProduct({ id, name, category });
  if (!product) return res.status(400).json({ error: 'Product ID already exists' });
  res.status(201).json(product);
});

app.patch('/api/products/:id', (req, res) => {
  const { name, category } = req.body;
  const success = updateProduct(req.params.id, { name, category });
  if (!success) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true });
});

app.delete('/api/products/:id', (req, res) => {
  const success = deleteProduct(req.params.id);
  if (!success) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true });
});

// Variant endpoints
app.get('/api/products/:id/variants', (req, res) => {
  const variants = getVariants(req.params.id);
  res.json(variants.map(v => ({ ...v, inStock: v.stock > 0 })));
});

app.get('/api/variants/:id', (req, res) => {
  const variant = getVariant(req.params.id);
  if (!variant) return res.status(404).json({ error: 'Variant not found' });
  res.json({ ...variant, inStock: variant.stock > 0 });
});

app.post('/api/products/:id/variants', (req, res) => {
  const { color, size, material, stock = 0 } = req.body;
  if (!color || !size || !material) {
    return res.status(400).json({ error: 'color, size, and material are required' });
  }
  const variant = addVariant({ productId: req.params.id, color, size, material, stock: parseInt(stock) });
  if (!variant) return res.status(400).json({ error: 'Variant already exists or invalid product' });
  res.status(201).json(variant);
});

app.patch('/api/variants/:id', (req, res) => {
  const { color, size, material, stock } = req.body;
  const variant = updateVariant(req.params.id, { color, size, material, stock: stock !== undefined ? parseInt(stock) : undefined });
  if (!variant) return res.status(404).json({ error: 'Variant not found' });
  res.json({ ...variant, inStock: variant.stock > 0 });
});

app.delete('/api/variants/:id', (req, res) => {
  const success = deleteVariant(req.params.id);
  if (!success) return res.status(404).json({ error: 'Variant not found' });
  res.json({ success: true });
});

// Order endpoint - decrement stock for specific variants
app.post('/api/order', (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items array is required' });
  }

  const results = [];
  const errors = [];

  for (const item of items) {
    const { productId, color, size, material, quantity = 1 } = item;
    if (!productId || !color || !size || !material) {
      errors.push({ ...item, error: 'productId, color, size, and material are required' });
      continue;
    }
    
    const variant = getVariantByProductAndOptions(productId, color, size, material);
    if (!variant) {
      errors.push({ ...item, error: 'Variant not found' });
      continue;
    }
    
    if (variant.stock < quantity) {
      errors.push({ ...item, error: `Insufficient stock (${variant.stock} available)`, variant });
      continue;
    }
    
    const updated = decrementVariantStock(variant.id, quantity);
    if (!updated) {
      errors.push({ ...item, error: 'Failed to update stock' });
      continue;
    }
    
    results.push({ productId, color, size, material, quantity, remainingStock: updated.stock });
  }

  if (errors.length > 0 && results.length === 0) {
    return res.status(400).json({ success: false, errors });
  }

  res.json({ success: true, processed: results, errors: errors.length > 0 ? errors : undefined });
});

// Product configs (for frontend dropdowns)
app.get('/api/configs', (req, res) => {
  res.json(getAllProductConfigs());
});

app.get('/api/configs/:productId', (req, res) => {
  const config = getProductConfig(req.params.productId);
  if (!config) return res.status(404).json({ error: 'Product config not found' });
  res.json(config);
});

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});