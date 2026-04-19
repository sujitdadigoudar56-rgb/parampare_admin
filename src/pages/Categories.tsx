import React, { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Edit, Trash2, Layers, Search, Image as ImageIcon } from 'lucide-react';
import CategoryModal from '../components/CategoryModal';

interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parent?: any;
  level: number;
}

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      const cats = response.data.data || response.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? Products in this category may become uncategorized.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert('Error deleting category. It might be in use.');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="categories-page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '700' }}>Category Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your product hierarchy and collections</p>
        </div>
        <button onClick={handleCreate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add Category
        </button>
      </header>

      <div style={{ 
        maxWidth: '400px', 
        marginBottom: '2rem',
        background: 'white',
        padding: '0.75rem',
        borderRadius: '0.75rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search categories..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            border: 'none', 
            outline: 'none', 
            width: '100%',
            fontSize: '0.875rem'
          }}
        />
      </div>

      <div style={{ background: 'white', borderRadius: '1rem', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>Loading categories...</div>
        ) : filteredCategories.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            {searchTerm ? 'No categories match your search.' : 'No categories found.'}
          </div>
        ) : (
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Parent</th>
                <th style={{ padding: '1rem' }}>Level</th>
                <th style={{ padding: '1rem' }}>Description</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#f1f5f9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {c.imageUrl ? <img src={c.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={20} color="#cbd5e1" />}
                      </div>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {c.parent ? (typeof c.parent === 'object' ? c.parent.name : c.parent) : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>None (Root)</span>}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.2rem 0.5rem', 
                      borderRadius: '4px', 
                      background: c.level === 0 ? '#eff6ff' : '#f0fdf4',
                      color: c.level === 0 ? '#3b82f6' : '#22c55e',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Lvl {c.level}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {c.description ? (c.description.length > 50 ? c.description.substring(0, 50) + '...' : c.description) : '-'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button onClick={() => handleEdit(c)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(c._id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
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

      <CategoryModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSaved={fetchCategories} 
        editCategory={selectedCategory}
        allCategories={categories}
      />
    </div>
  );
};

export default CategoriesPage;
