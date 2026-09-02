// =====================================================
// ScanGo — MongoDB Initialization Script
// Creates the catalog database and initial collections
// =====================================================

db = db.getSiblingDB('scango_catalog');

db.createCollection('products');
db.createCollection('categories');

// Create indexes
db.products.createIndex({ barcode: 1 }, { unique: true });
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ name: 'text', description: 'text' });
db.products.createIndex({ category_id: 1 });

db.categories.createIndex({ category_id: 1 }, { unique: true });

print('MongoDB scango_catalog database initialized with collections and indexes');
