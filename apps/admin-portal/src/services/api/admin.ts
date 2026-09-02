export interface StoreConfig {
  id: string;
  name: string;
  self_scan_enabled: boolean;
  verification_threshold: number;
  operating_hours: string;
}

export interface Product {
  sku: string;
  name: string;
  price: number;
  category: string;
  stock: number;
}

// Mocked Data
let mockConfig: StoreConfig = {
  id: 'store_1',
  name: 'ScanGo Downtown',
  self_scan_enabled: true,
  verification_threshold: 0.15, // 15% random check
  operating_hours: '08:00-22:00'
};

let mockCatalog: Product[] = [
  { sku: 'SKU001', name: 'Organic Milk 1L', price: 65, category: 'Dairy', stock: 120 },
  { sku: 'SKU002', name: 'Whole Wheat Bread', price: 40, category: 'Bakery', stock: 45 },
  { sku: 'SKU003', name: 'Premium Coffee 500g', price: 350, category: 'Beverages', stock: 24 }
];

export const adminApi = {
  fetchStoreConfig: async (storeId: string): Promise<StoreConfig> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { ...mockConfig, id: storeId };
  },

  updateStoreConfig: async (storeId: string, updates: Partial<StoreConfig>): Promise<StoreConfig> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    mockConfig = { ...mockConfig, ...updates, id: storeId };
    return mockConfig;
  },

  fetchCatalog: async (): Promise<Product[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...mockCatalog];
  },

  updateProductPrice: async (sku: string, newPrice: number): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const product = mockCatalog.find(p => p.sku === sku);
    if (product) {
      product.price = newPrice;
      return true;
    }
    return false;
  }
};
