import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Plus, Eye, Trash2, Search, Package, ArrowLeft, ArrowRight } from 'lucide-react';
import ProductModal from '../components/ProductModal';

interface Product {
  _id: string;
  name: string;
  price: number;
  category: any;
  stockQuantity: number;
  images: string[];
  badges: string[];
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const cats = response.data.data || response.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: { 
          search: searchTerm,
          category: category || undefined,
          stockStatus: stockStatus || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          page: page,
          limit: 10
        }
      });
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, category, stockStatus, minPrice, maxPrice, page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (error) {
      alert('Error deleting product');
    }
  };

  const inputStyle = { 
    padding: '0.625rem 0.75rem', 
    borderRadius: '0.5rem', 
    border: '1px solid var(--border)', 
    outline: 'none',
    fontSize: '0.875rem'
  };

  return (
    <div className="products-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Product Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your catalog and inventory</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Product
        </button>
      </header>

      {/* Filter Bar */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem',
        background: 'white',
        padding: '1.25rem',
        borderRadius: '0.75rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ ...inputStyle, width: '100%', paddingLeft: '2.5rem', boxSizing: 'border-box' }}
          />
        </div>

        {/* Category */}
        <select 
          value={category} 
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          style={{ ...inputStyle, width: '100%' }}
        >
          <option value="">All Categories</option>
          {categories.map(cat => {
            const catName = typeof cat === 'object' ? cat.name : cat;
            return <option key={catName} value={catName}>{catName}</option>;
          })}
        </select>

        {/* Stock Status */}
        <select 
          value={stockStatus} 
          onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
          style={{ ...inputStyle, width: '100%' }}
        >
          <option value="">All Stock Status</option>
          <option value="inStock">In Stock</option>
          <option value="lowStock">Low Stock (≤ 10)</option>
          <option value="outOfStock">Out of Stock</option>
        </select>

        {/* Price Range */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input 
            type="number" 
            placeholder="Min Price" 
            value={minPrice}
            onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
            style={{ ...inputStyle, width: '100%' }}
          />
          <span style={{ color: 'var(--text-muted)' }}>-</span>
          <input 
            type="number" 
            placeholder="Max Price" 
            value={maxPrice}
            onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</div>
        ) : (
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Product</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Stock</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#f1f5f9', overflow: 'hidden' }}>
                        {p.images?.[0] ? <img src={p.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={20} color="#cbd5e1" />}
                      </div>
                      <Link to={`/products/${p._id}`} style={{ fontWeight: '600', color: 'var(--text-main)', textDecoration: 'none' }}>
                        {p.name}
                      </Link>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>{p.category?.name || p.category || 'N/A'}</td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>₹{p.price.toLocaleString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge badge-${p.stockQuantity > 0 ? 'success' : 'danger'}`}>
                      {p.stockQuantity} in stock
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Link to={`/products/${p._id}`} title="View/Edit" style={{ color: 'var(--primary)' }}>
                        <Eye size={18} />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page === 1}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
        >
          <ArrowLeft size={18} />
        </button>
        <span style={{ fontWeight: '600' }}>Page {page} of {totalPages}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
          disabled={page === totalPages}
          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
        >
          <ArrowRight size={18} />
        </button>
      </div>

      <ProductModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSaved={fetchProducts} 
      />
    </div>
  );
};

export default ProductsPage;
