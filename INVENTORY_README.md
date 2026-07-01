# Bensoft Prints - Inventory System

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at `http://localhost:3000`

### 3. Access Pages
- **Customer site**: http://localhost:3000/tshirt-order.html (shows live stock)
- **Admin panel**: http://localhost:3000/admin.html (manage inventory)
- **API health**: http://localhost:3000/api/health
- **All inventory**: http://localhost:3000/api/inventory

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory` | List all items with stock |
| GET | `/api/inventory/:id` | Get single item |
| POST | `/api/inventory` | Add new item (admin) |
| PATCH | `/api/inventory/:id` | Update stock (admin) |
| DELETE | `/api/inventory/:id` | Delete item (admin) |
| POST | `/api/order` | Process order & decrement stock |

## Frontend Integration

Add to any order page:
```html
<script src="/inventory-check.js"></script>
<script>
  InventoryCheck.init({ itemId: 'tshirt', selector: '#stock-status' });
</script>
<div id="stock-status"></div>
```

## Auto Stock Decrement

When customer places order via cart → checkout, stock is automatically decremented via `/api/order`.

## Inventory IDs

| Product | Inventory ID |
|---------|--------------|
| T-Shirt | `tshirt` |
| Hoodie | `hoodie` |
| Polo Shirt | `polo` |
| Cap | `cap` |
| Mug | `mug` |
| Notebook | `notebook` |
| Sticker Pack | `sticker` |
| Lanyard | `lanyard` |
| Wristband | `wristband` |
| Umbrella | `umbrella` |
| Custom Pillow | `pillow` |
| Business Cards | `business-card` |
| Banner | `banner` |
| Poster | `poster` |
| ID Card | `id-card` |
| Wedding Card | `wedding-card` |
| Reflector Jacket | `reflector` |
| Dustcoat | `dustcoat` |
| Sports Jersey | `jersey` |
| Decal | `decal` |

## Database

SQLite file: `server/inventory.db` (auto-created on first run)