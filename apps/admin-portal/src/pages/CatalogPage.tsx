import React, { useEffect, useState } from 'react';
import { adminApi, Product } from '../services/api/admin';
import { Save } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingSku, setEditingSku] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);

  useEffect(() => {
    adminApi.fetchCatalog().then(setProducts);
  }, []);

  const handleEditClick = (product: Product) => {
    setEditingSku(product.sku);
    setEditPrice(product.price);
  };

  const handleSavePrice = async (sku: string) => {
    const success = await adminApi.updateProductPrice(sku, editPrice);
    if (success) {
      setProducts(products.map(p => p.sku === sku ? { ...p, price: editPrice } : p));
    }
    setEditingSku(null);
  };

  return (
    <div>
      <h1 style={{ margin: '0 0 24px 0', fontSize: '1.875rem' }}>Product Catalog</h1>
      
      <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            <tr>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563' }}>SKU</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563' }}>Name</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563' }}>Category</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563' }}>Stock</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563' }}>Price</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#4b5563', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.sku} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px', color: '#111827', fontFamily: 'monospace' }}>{p.sku}</td>
                <td style={{ padding: '16px', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '16px', color: '#6b7280' }}>{p.category}</td>
                <td style={{ padding: '16px', color: '#6b7280' }}>{p.stock}</td>
                <td style={{ padding: '16px', color: '#10b981', fontWeight: 600 }}>
                  {editingSku === p.sku ? (
                    <input 
                      type="number" 
                      value={editPrice}
                      onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', width: '80px' }}
                    />
                  ) : (
                    `₹${p.price}`
                  )}
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  {editingSku === p.sku ? (
                    <button 
                      onClick={() => handleSavePrice(p.sku)}
                      style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}
                    >
                      <Save size={14} /> Save
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleEditClick(p)}
                      style={{ padding: '6px 12px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Edit Price
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
