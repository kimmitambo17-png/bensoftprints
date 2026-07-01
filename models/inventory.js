const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'inventory.db');
let db;

const PRODUCT_CONFIG = {
  tshirt: {
    name: 'T-Shirt',
    category: 'apparel',
    colors: ['White', 'Black', 'Orange Red', 'Royal Blue', 'Yellow', 'Forest Green', 'Purple', 'Maroon'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materials: ['Cotton', 'Polyester', 'Blend'],
    defaultColor: 'White',
    defaultSize: 'M',
    defaultMaterial: 'Cotton'
  },
  hoodie: {
    name: 'Hoodie',
    category: 'apparel',
    colors: ['Black', 'Navy', 'Grey', 'White', 'Maroon', 'Forest Green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materials: ['Cotton', 'Fleece', 'Polyester Blend'],
    defaultColor: 'Black',
    defaultSize: 'M',
    defaultMaterial: 'Fleece'
  },
  polo: {
    name: 'Polo Shirt',
    category: 'apparel',
    colors: ['White', 'Black', 'Navy', 'Royal Blue', 'Red', 'Green', 'Yellow'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materials: ['Cotton', 'Pique Cotton', 'Polyester'],
    defaultColor: 'Navy',
    defaultSize: 'M',
    defaultMaterial: 'Pique Cotton'
  },
  cap: {
    name: 'Cap',
    category: 'apparel',
    colors: ['Black', 'White', 'Navy', 'Red', 'Grey', 'Khaki'],
    sizes: ['One Size'],
    materials: ['Cotton', 'Polyester', 'Wool Blend'],
    defaultColor: 'Black',
    defaultSize: 'One Size',
    defaultMaterial: 'Cotton'
  },
  reflector: {
    name: 'Reflector Jacket',
    category: 'apparel',
    colors: ['Neon Yellow', 'Neon Orange', 'Lime Green'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    materials: ['Polyester Mesh', 'PVC Coated'],
    defaultColor: 'Neon Yellow',
    defaultSize: 'M',
    defaultMaterial: 'Polyester Mesh'
  },
  dustcoat: {
    name: 'Dustcoat',
    category: 'apparel',
    colors: ['White', 'Navy', 'Khaki', 'Royal Blue'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materials: ['Cotton', 'Polycotton', 'Canvas'],
    defaultColor: 'White',
    defaultSize: 'M',
    defaultMaterial: 'Polycotton'
  },
  jersey: {
    name: 'Sports Jersey',
    category: 'apparel',
    colors: ['Red', 'Blue', 'Black', 'White', 'Green', 'Yellow', 'Orange'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materials: ['Polyester Mesh', 'Dry-Fit'],
    defaultColor: 'Red',
    defaultSize: 'M',
    defaultMaterial: 'Polyester Mesh'
  },
  mug: {
    name: 'Mug',
    category: 'gifts',
    colors: ['White', 'Black', 'Blue', 'Red', 'Green'],
    sizes: ['11oz', '15oz'],
    materials: ['Ceramic', 'Enamel'],
    defaultColor: 'White',
    defaultSize: '11oz',
    defaultMaterial: 'Ceramic'
  },
  notebook: {
    name: 'Notebook',
    category: 'gifts',
    colors: ['Black', 'Navy', 'Brown', 'Red', 'Green', 'Grey'],
    sizes: ['A4', 'A5', 'A6'],
    materials: ['Hardcover', 'Softcover', 'Leatherette'],
    defaultColor: 'Black',
    defaultSize: 'A5',
    defaultMaterial: 'Hardcover'
  },
  sticker: {
    name: 'Sticker Pack',
    category: 'gifts',
    colors: ['Full Color', 'White Vinyl', 'Clear Vinyl', 'Holographic'],
    sizes: ['Small (5cm)', 'Medium (8cm)', 'Large (12cm)'],
    materials: ['Vinyl', 'Paper', 'Waterproof Vinyl'],
    defaultColor: 'Full Color',
    defaultSize: 'Medium (8cm)',
    defaultMaterial: 'Vinyl'
  },
  lanyard: {
    name: 'Lanyard',
    category: 'gifts',
    colors: ['Blue', 'Black', 'Red', 'Green', 'Yellow', 'Orange', 'White'],
    sizes: ['Standard (20mm)', 'Wide (25mm)'],
    materials: ['Polyester', 'Nylon', 'Satin'],
    defaultColor: 'Blue',
    defaultSize: 'Standard (20mm)',
    defaultMaterial: 'Polyester'
  },
  wristband: {
    name: 'Wristband',
    category: 'gifts',
    colors: ['Black', 'Blue', 'Red', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'White'],
    sizes: ['Adult (202mm)', 'Youth (180mm)', 'Child (150mm)'],
    materials: ['Silicone', 'Fabric', 'Tyvek'],
    defaultColor: 'Blue',
    defaultSize: 'Adult (202mm)',
    defaultMaterial: 'Silicone'
  },
  umbrella: {
    name: 'Umbrella',
    category: 'gifts',
    colors: ['Black', 'Navy', 'Red', 'Green', 'Grey', 'White'],
    sizes: ['Compact (21")', 'Standard (23")', 'Large (27")', 'Golf (30")'],
    materials: ['Polyester', 'Pongee', 'Nylon'],
    defaultColor: 'Black',
    defaultSize: 'Standard (23")',
    defaultMaterial: 'Pongee'
  },
  pillow: {
    name: 'Custom Pillow',
    category: 'gifts',
    colors: ['White', 'Cream', 'Grey', 'Black'],
    sizes: ['16x16"', '18x18"', '20x20"', '12x20" (Lumbar)'],
    materials: ['Polyester', 'Cotton', 'Velvet', 'Linen'],
    defaultColor: 'White',
    defaultSize: '18x18"',
    defaultMaterial: 'Polyester'
  },
  'business-card': {
    name: 'Business Cards',
    category: 'print',
    colors: ['Full Color', 'Black Only', '2-Color'],
    sizes: ['Standard (90x54mm)', 'Square (55x55mm)', 'Mini (70x30mm)'],
    materials: ['350gsm Matte', '350gsm Gloss', '400gsm Silk', '450gsm Uncoated', 'Premium Textured'],
    defaultColor: 'Full Color',
    defaultSize: 'Standard (90x54mm)',
    defaultMaterial: '350gsm Matte'
  },
  banner: {
    name: 'Banner',
    category: 'print',
    colors: ['Full Color'],
    sizes: ['2x3ft', '3x4ft', '4x6ft', '3x8ft', '4x8ft', 'Custom'],
    materials: ['PVC Vinyl', 'Mesh Vinyl', 'Fabric', 'Blackout'],
    defaultColor: 'Full Color',
    defaultSize: '3x4ft',
    defaultMaterial: 'PVC Vinyl'
  },
  poster: {
    name: 'Poster',
    category: 'print',
    colors: ['Full Color'],
    sizes: ['A3', 'A2', 'A1', 'A0', 'Custom'],
    materials: ['170gsm Gloss', '170gsm Matte', '200gsm Silk', 'Photo Paper'],
    defaultColor: 'Full Color',
    defaultSize: 'A2',
    defaultMaterial: '170gsm Gloss'
  },
  'id-card': {
    name: 'ID Card',
    category: 'print',
    colors: ['Full Color', 'Single Side', 'Double Side'],
    sizes: ['CR80 (85.6x54mm)'],
    materials: ['PVC', 'Composite', 'Smart Card'],
    defaultColor: 'Full Color',
    defaultSize: 'CR80 (85.6x54mm)',
    defaultMaterial: 'PVC'
  },
  'wedding-card': {
    name: 'Wedding Card',
    category: 'print',
    colors: ['Full Color', 'Gold Foil', 'Silver Foil', 'Rose Gold Foil'],
    sizes: ['A5', 'A6', 'Square (148x148mm)', 'DL (210x99mm)', 'Custom'],
    materials: ['300gsm Matte', '300gsm Gloss', '350gsm Textured', 'Pearl Finish', 'Cotton Paper'],
    defaultColor: 'Full Color',
    defaultSize: 'A5',
    defaultMaterial: '300gsm Matte'
  },
  decal: {
    name: 'Decal',
    category: 'gifts',
    colors: ['Full Color', 'White', 'Black', 'Clear', 'Metallic Gold', 'Metallic Silver'],
    sizes: ['Small (5cm)', 'Medium (10cm)', 'Large (20cm)', 'XL (30cm)', 'Custom'],
    materials: ['Vinyl', 'Clear Vinyl', 'Reflective', 'Etched Glass'],
    defaultColor: 'Full Color',
    defaultSize: 'Medium (10cm)',
    defaultMaterial: 'Vinyl'
  }
};

function initDB() {
  db = new Database(DB_PATH);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      color TEXT NOT NULL,
      size TEXT NOT NULL,
      material TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      sku TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    
    CREATE INDEX IF NOT EXISTS idx_variants_product ON variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_variants_sku ON variants(sku);
  `);
  
  seedInitialData();
}

function generateSKU(productId, color, size, material) {
  const colorCode = color.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const sizeCode = size.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  const materialCode = material.replace(/\s+/g, '').substring(0, 3).toUpperCase();
  return `${productId.toUpperCase()}-${colorCode}-${sizeCode}-${materialCode}`;
}

function seedInitialData() {
  const insertProduct = db.prepare('INSERT OR IGNORE INTO products (id, name, category) VALUES (?, ?, ?)');
  const insertVariant = db.prepare('INSERT OR IGNORE INTO variants (id, product_id, color, size, material, stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?)');
  
  const seedTransaction = db.transaction(() => {
    for (const [productId, config] of Object.entries(PRODUCT_CONFIG)) {
      insertProduct.run(productId, config.name, config.category);
      
      let variantCount = 0;
      for (const color of config.colors) {
        for (const size of config.sizes) {
          for (const material of config.materials) {
            variantCount++;
            if (variantCount > 50) break; // Limit variants per product
            
            const variantId = `${productId}-${color}-${size}-${material}`.replace(/\s+/g, '-').toLowerCase();
            const sku = generateSKU(productId, color, size, material);
            const stock = Math.floor(Math.random() * 30) + 5;
            
            insertVariant.run(variantId, productId, color, size, material, stock, sku);
          }
          if (variantCount > 50) break;
        }
        if (variantCount > 50) break;
      }
    }
  });
  
  seedTransaction();
}

function getProducts() {
  return db.prepare('SELECT * FROM products ORDER BY category, name').all();
}

function getProduct(id) {
  return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

function getVariants(productId) {
  return db.prepare('SELECT * FROM variants WHERE product_id = ? ORDER BY color, size, material').all(productId);
}

function getVariant(variantId) {
  return db.prepare('SELECT * FROM variants WHERE id = ?').get(variantId);
}

function getVariantByProductAndOptions(productId, color, size, material) {
  return db.prepare('SELECT * FROM variants WHERE product_id = ? AND color = ? AND size = ? AND material = ?')
    .get(productId, color, size, material);
}

function getAllVariantsWithProducts() {
  return db.prepare(`
    SELECT v.*, p.name as product_name, p.category 
    FROM variants v 
    JOIN products p ON v.product_id = p.id 
    ORDER BY p.category, p.name, v.color, v.size, v.material
  `).all();
}

function getTotalStock(productId) {
  const result = db.prepare('SELECT SUM(stock) as total FROM variants WHERE product_id = ?').get(productId);
  return result?.total || 0;
}

function addProduct({ id, name, category }) {
  const result = db.prepare('INSERT INTO products (id, name, category) VALUES (?, ?, ?)').run(id, name, category);
  if (result.changes === 0) return null;
  return { id, name, category };
}

function updateProduct(id, { name, category }) {
  const result = db.prepare('UPDATE products SET name = ?, category = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, category, id);
  return result.changes > 0;
}

function deleteProduct(id) {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return result.changes > 0;
}

function addVariant({ productId, color, size, material, stock = 0 }) {
  const variantId = `${productId}-${color}-${size}-${material}`.replace(/\s+/g, '-').toLowerCase();
  const sku = generateSKU(productId, color, size, material);
  
  const result = db.prepare(
    'INSERT INTO variants (id, product_id, color, size, material, stock, sku) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(variantId, productId, color, size, material, stock, sku);
  
  if (result.changes === 0) return null;
  
  return { id: variantId, productId, color, size, material, stock, sku, inStock: stock > 0 };
}

function updateVariantStock(variantId, stock) {
  const result = db.prepare('UPDATE variants SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(stock, variantId);
  if (result.changes === 0) return null;
  const variant = getVariant(variantId);
  return { ...variant, inStock: stock > 0 };
}

function decrementVariantStock(variantId, quantity = 1) {
  const variant = getVariant(variantId);
  if (!variant) return null;
  const newStock = Math.max(0, variant.stock - quantity);
  return updateVariantStock(variantId, newStock);
}

function updateVariant(variantId, { color, size, material, stock }) {
  const updates = [];
  const params = [];
  if (color !== undefined) { updates.push('color = ?'); params.push(color); }
  if (size !== undefined) { updates.push('size = ?'); params.push(size); }
  if (material !== undefined) { updates.push('material = ?'); params.push(material); }
  if (stock !== undefined) { updates.push('stock = ?'); params.push(stock); }
  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(variantId);
  
  const result = db.prepare(`UPDATE variants SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  if (result.changes === 0) return null;
  return getVariant(variantId);
}

function deleteVariant(variantId) {
  const result = db.prepare('DELETE FROM variants WHERE id = ?').run(variantId);
  return result.changes > 0;
}

function getProductConfig(productId) {
  return PRODUCT_CONFIG[productId] || null;
}

function getAllProductConfigs() {
  return PRODUCT_CONFIG;
}

module.exports = {
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
};