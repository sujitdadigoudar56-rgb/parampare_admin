import React, { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import ProductModal from '../components/ProductModal';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: any;
  stockQuantity: number;
  inStock: boolean;
  images: string[];
  badges: string[];
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products');
      // GET /api/products returns { success, products, count, totalPages, currentPage }
      const data = response.data.products ?? response.data.data ?? response.data;
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch {
      alert('Failed to delete product');
    }
  };

  const openCreate = () => { setEditProduct(null); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditProduct(p); setModalOpen(true); };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ padding: '2rem' }}>Loading products...</div>;

  if (error) return (
    <div style={{ padding: '2rem', color: 'var(--danger)' }}>⚠️ {error}</div>
  );

  return (
    <div className="products-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Product Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{products.length} total products</p>
        </div>
        <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Product
        </button>
      </header>

      <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
            borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none', fontSize: '0.875rem',
          }}
        />
      </div>

      {filteredProducts.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '1rem', padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <p>No products found. Click "Add Product" to create one.</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Badges</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(product => (
              <tr key={product._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={18} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    )}
                    <span style={{ fontWeight: 500, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {product.name}
                    </span>
                  </div>
                </td>
                <td>{product.category?.name || 'Uncategorized'}</td>
                <td>
                  ₹{product.price?.toLocaleString()}
                </td>
                <td>
                  <span className={`badge badge-${product.stockQuantity > 0 ? 'success' : 'danger'}`}>
                    {product.stockQuantity ?? 0}
                  </span>
                </td>
                <td>
                  {(product.badges || []).map(b => (
                    <span key={b} className="badge badge-warning" style={{ marginRight: 4, fontSize: '0.7rem' }}>{b}</span>
                  ))}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button title="Edit" onClick={() => openEdit(product)} style={{ background: 'none', color: 'var(--primary)' }}>
                      <Edit size={18} />
                    </button>
                    <button title="Delete" onClick={() => handleDelete(product._id)} style={{ background: 'none', color: 'var(--danger)' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchProducts}
        editProduct={editProduct}
      />
    </div>
  );
};

export default Products;
