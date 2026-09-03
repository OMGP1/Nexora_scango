import React, { useState, useEffect } from 'react';
import { Card, Button, Toast } from '@scango/ui';
import { Search, Plus, X } from 'lucide-react';
import { adminApi } from '../services/api/admin';

export const CatalogPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as any });

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: '', name: '', barcode: '', unit_price: '', tax_class: 'standard' });

  useEffect(() => {
    adminApi.fetchCatalog().then(setItems);
  }, []);

  const handleSavePrice = async (sku: string) => {
    try {
      await adminApi.updateProductPrice(sku, editPrice);
      setItems(items.map(item => item.sku === sku ? { ...item, unit_price: editPrice } : item));
      setToast({ visible: true, message: 'Price updated', type: 'success' });
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    } catch (e) {
      setToast({ visible: true, message: 'Update failed', type: 'error' });
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    } finally {
      setEditingId(null);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const product = await adminApi.createProduct({
        ...newProduct,
        unit_price: parseFloat(newProduct.unit_price)
      });
      setItems([product, ...items]);
      setShowAddModal(false);
      setNewProduct({ sku: '', name: '', barcode: '', unit_price: '', tax_class: 'standard' });
      setToast({ visible: true, message: 'Product added successfully', type: 'success' });
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    } catch (e) {
      setToast({ visible: true, message: 'Failed to add product', type: 'error' });
      setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
    }
  };

  const filteredItems = items.filter(item => 
    (item.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (item.sku || '').includes(search)
  );

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px', fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing-tight)' }}>Product Catalog</h1>
          <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Manage pricing and inventory</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add Product
        </Button>
      </div>

      <Card padding="lg">
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 16px 10px 40px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>SKU</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Category</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Barcode</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-wide)' }}>Price</th>
                <th style={{ padding: '12px 16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.sku} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{item.sku}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{item.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{item.tax_class || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>{item.barcode || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {editingId === item.sku ? (
                      <input 
                        type="number" 
                        value={editPrice}
                        onChange={e => setEditPrice(parseFloat(e.target.value))}
                        style={{ width: '80px', padding: '6px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--color-primary)' }}
                        autoFocus
                      />
                    ) : (
                      `₹${item.unit_price}`
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {editingId === item.sku ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleSavePrice(item.sku)}>Save</Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => { setEditingId(item.sku); setEditPrice(item.unit_price); }}>Edit</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <Card padding="lg" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
              <X size={20} />
            </button>
            <h2 style={{ margin: '0 0 24px', fontSize: 'var(--font-size-xl)' }}>Add New Product</h2>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Product Name</label>
                <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>SKU (Unique ID)</label>
                <input required value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Barcode</label>
                <input required value={newProduct.barcode} onChange={e => setNewProduct({...newProduct, barcode: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Price (₹)</label>
                  <input required type="number" step="0.01" value={newProduct.unit_price} onChange={e => setNewProduct({...newProduct, unit_price: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Tax Class</label>
                  <select value={newProduct.tax_class} onChange={e => setNewProduct({...newProduct, tax_class: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                    <option value="standard">Standard</option>
                    <option value="GST_0">GST 0%</option>
                    <option value="GST_5">GST 5%</option>
                    <option value="GST_12">GST 12%</option>
                    <option value="GST_18">GST 18%</option>
                  </select>
                </div>
              </div>
              <Button type="submit" style={{ marginTop: '8px' }} fullWidth>Add Product</Button>
            </form>
          </Card>
        </div>
      )}
      
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, visible: false }))} />
    </div>
  );
};
