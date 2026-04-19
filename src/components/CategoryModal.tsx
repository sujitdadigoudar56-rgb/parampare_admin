import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { X, ImagePlus, Loader2 } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  parent?: string | null | { _id: string, name: string };
  level?: number;
}

interface CategoryFormData {
  name: string;
  description: string;
  imageUrl: string;
  parent: string;
}

const INITIAL_FORM: CategoryFormData = {
  name: '',
  description: '',
  imageUrl: '',
  parent: '',
};

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editCategory?: Category | null;
  allCategories: Category[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({ 
  isOpen, 
  onClose, 
  onSaved, 
  editCategory, 
  allCategories 
}) => {
  const [form, setForm] = useState<CategoryFormData>(INITIAL_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setError('');
    if (!isOpen) return;

    if (editCategory) {
      const parentId = typeof editCategory.parent === 'object' && editCategory.parent 
        ? editCategory.parent._id 
        : (editCategory.parent || '');
        
      setForm({
        name: editCategory.name || '',
        description: editCategory.description || '',
        imageUrl: editCategory.imageUrl || '',
        parent: parentId as string,
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [editCategory, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');
    const data = new FormData();
    data.append('images', file); // Backend expects 'images' field even for single upload based on ProductModal

    try {
      const res = await api.post('/admin/upload', data, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      // res.data.urls is an array from the backend
      if (res.data.urls && res.data.urls.length > 0) {
        setForm(prev => ({ ...prev, imageUrl: res.data.urls[0] }));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Category name is required');

    setSaving(true);
    const payload = {
      ...form,
      parent: form.parent || null,
    };

    try {
      if (editCategory) {
        await api.put(`/categories/${editCategory._id}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const inp: React.CSSProperties = {
    width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.5rem',
    border: '1px solid var(--border)', outline: 'none', fontSize: '0.875rem', background: '#fff',
    boxSizing: 'border-box',
  };
  const lbl: React.CSSProperties = {
    display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem',
  };
  const grp: React.CSSProperties = { marginBottom: '1rem' };
  const card: React.CSSProperties = {
    background: '#f8fafc', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }} />

      <div style={{ position: 'relative', width: '500px', maxWidth: '95vw', maxHeight: '90vh', background: 'white', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{editCategory ? 'Edit Category' : 'Add New Category'}</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', padding: '0.25rem', cursor: 'pointer', border: 'none' }}><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', overflowY: 'auto' }}>
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={card}>
            <p style={{ fontWeight: 700, fontSize: '0.8rem', color: '#334155', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Category Image</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 80, height: 80, borderRadius: 8, border: '1px solid var(--border)', background: '#fff', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {form.imageUrl ? (
                  <img src={form.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <ImagePlus size={30} color="#cbd5e1" />
                )}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                {uploading ? <Loader2 size={16} className="animate-spin" /> : 'Choose Image'}
              </button>
              {form.imageUrl && (
                <button type="button" onClick={() => setForm(prev => ({ ...prev, imageUrl: '' }))} style={{ color: '#ef4444', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          </div>

          <div style={grp}>
            <label style={lbl}>Category Name *</label>
            <input name="name" required value={form.name} onChange={handleChange} style={inp} placeholder="e.g. Silk Sarees" />
          </div>

          <div style={grp}>
            <label style={lbl}>Parent Category</label>
            <select name="parent" value={form.parent} onChange={handleChange} style={inp}>
              <option value="">None (Top Level)</option>
              {allCategories
                .filter(c => c._id !== editCategory?._id) // Prevent self-parenting
                .map(c => <option key={c._id} value={c._id}>{c.name}</option>)
              }
            </select>
          </div>

          <div style={grp}>
            <label style={lbl}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ ...inp, resize: 'vertical' }} placeholder="Brief description..." />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontWeight: 500 }}>
              Cancel
            </button>
            <button type="submit" disabled={saving || uploading} className="btn-primary" style={{ padding: '0.625rem 1.5rem', opacity: (saving || uploading) ? 0.7 : 1 }}>
              {saving ? 'Saving...' : editCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
