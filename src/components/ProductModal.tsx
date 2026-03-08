import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { X, ImagePlus, Loader2 } from 'lucide-react';
import { 
  FABRIC_OPTIONS, COLOR_OPTIONS, OCCASION_OPTIONS, WEAVE_OPTIONS, 
  BORDER_OPTIONS, PALLU_OPTIONS, BLOUSE_OPTIONS, BADGE_OPTIONS 
} from '../constants/productOptions';

// ── Types ────────────────────────────────────────────────────────────────────

interface Category {
  _id: string;
  name: string;
  parent: string | null | { _id: string };
  level: number;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  category: string;      // parent category _id
  subcategory: string;   // child category _id
  fabric: string;
  color: string;
  occasion: string;
  weave: string;
  border: string;
  pallu: string;
  blouse: string;
  stockQuantity: string;
  badges: string[];
  careInstructions: string;
  images: string[];
  rating: string;
  reviewCount: string;
  reviewDescription: string;
}

const INITIAL_FORM: ProductFormData = {
  name: '', description: '', price: '', originalPrice: '',
  category: '', subcategory: '',
  fabric: '', color: '', occasion: '',
  weave: '', border: '', pallu: '', blouse: '',
  stockQuantity: '0', badges: [], careInstructions: '', images: [],
  rating: '0', reviewCount: '0', reviewDescription: '',
};


interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editProduct?: any;
}

// ── Component ────────────────────────────────────────────────────────────────

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSaved, editProduct }) => {
  const [form, setForm] = useState<ProductFormData>(INITIAL_FORM);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived: top-level categories (level 0 or no parent)
  const parentCategories = allCategories.filter(c =>
    !c.parent || c.parent === null || (typeof c.parent === 'object' && !c.parent._id)
  );

  // Derived: subcategories matching the selected parent
  const subcategories = allCategories.filter(c => {
    if (!form.category || !c.parent) return false;
    const parentId = typeof c.parent === 'object' ? c.parent._id : c.parent;
    return parentId === form.category;
  });

  // ── Fetch all categories once ──────────────────────────────────────────────
  useEffect(() => {
    api.get('/categories')
      .then(r => {
        const cats = r.data.data || r.data.categories || r.data || [];
        setAllCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => {/* silent */});
  }, []);

  // ── Reset form on open/close ───────────────────────────────────────────────
  useEffect(() => {
    setError('');
    if (!isOpen) return;

    if (editProduct) {
      const catId = editProduct.category?._id || editProduct.category || '';
      const subId = editProduct.subcategory?._id || editProduct.subcategory || '';
      setForm({
        name: editProduct.name || '',
        description: editProduct.description || '',
        price: String(editProduct.price || ''),
        originalPrice: String(editProduct.originalPrice || ''),
        category: catId,
        subcategory: subId,
        fabric: editProduct.fabric || '',
        color: editProduct.color || '',
        occasion: editProduct.occasion || '',
        weave: editProduct.weave || '',
        border: editProduct.border || '',
        pallu: editProduct.pallu || '',
        blouse: editProduct.blouse || '',
        stockQuantity: String(editProduct.stockQuantity || 0),
        badges: editProduct.badges || [],
        careInstructions: (editProduct.careInstructions || []).join(', '),
        images: editProduct.images || [],
        rating: String(editProduct.rating || 0),
        reviewCount: String(editProduct.reviewCount || 0),
        reviewDescription: editProduct.reviewDescription || '',
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [editProduct, isOpen]);

  // ── When category changes, reset subcategory ──────────────────────────────
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, category: e.target.value, subcategory: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleBadge = (badge: string) => {
    setForm(prev => ({
      ...prev,
      badges: prev.badges.includes(badge) ? prev.badges.filter(b => b !== badge) : [...prev.badges, badge],
    }));
  };

  // ── Image Upload ──────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (form.images.length + files.length > 5) { setError('Maximum 5 images allowed'); return; }

    setUploading(true);
    setError('');
    const data = new FormData();
    Array.from(files).forEach(f => data.append('images', f));

    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(prev => ({ ...prev, images: [...prev.images, ...res.data.urls] }));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Product name is required');
    if (!form.description.trim()) return setError('Description is required');
    if (!form.price || Number(form.price) <= 0) return setError('Valid price is required');
    if (!form.category) return setError('Please select a category');

    setSaving(true);
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      category: form.category,
      subcategory: form.subcategory || undefined,
      fabric: form.fabric || undefined,
      color: form.color || undefined,
      occasion: form.occasion || undefined,
      weave: form.weave || undefined,
      border: form.border || undefined,
      pallu: form.pallu || undefined,
      blouse: form.blouse || undefined,
      stockQuantity: Number(form.stockQuantity),
      inStock: Number(form.stockQuantity) > 0,
      badges: form.badges,
      careInstructions: form.careInstructions
        ? form.careInstructions.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      images: form.images,
      rating: Number(form.rating),
      reviewCount: Number(form.reviewCount),
      reviewDescription: form.reviewDescription,
    };

    try {
      if (editProduct) {
        await api.put(`/admin/products/${editProduct._id}`, payload);
      } else {
        await api.post('/admin/products', payload);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  // ── Styles ─────────────────────────────────────────────────────────────────
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
  const cardTitle: React.CSSProperties = {
    fontWeight: 700, fontSize: '0.8rem', color: '#334155',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }} />

      <div style={{ position: 'relative', width: '600px', maxWidth: '95vw', height: '100vh', background: 'white', boxShadow: '-4px 0 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', padding: '0.25rem', cursor: 'pointer' }}><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>

          {/* Error */}
          {error && (
            <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              ⚠️ {error}
            </div>
          )}

          {/* ── Images ── */}
          <div style={card}>
            <p style={cardTitle}>Product Images (up to 5)</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {form.images.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt="" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border)' }} />
                  <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={10} />
                  </button>
                </div>
              ))}
              {form.images.length < 5 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  style={{ width: 72, height: 72, borderRadius: 8, border: '2px dashed var(--border)', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 4, color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  {uploading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <ImagePlus size={18} />}
                  {uploading ? 'Uploading...' : 'Add Image'}
                </button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {form.images.length > 0 && form.images[0].startsWith('http')
                ? '✅ Images stored in AWS S3'
                : '📁 Images stored locally. Add AWS credentials to .env for S3.'}
            </p>
          </div>

          {/* ── Basic Info ── */}
          <div style={card}>
            <p style={cardTitle}>Basic Information</p>
            <div style={grp}>
              <label style={lbl}>Product Name *</label>
              <input name="name" required value={form.name} onChange={handleChange} style={inp} placeholder="e.g. Kanjivaram Silk Saree" />
            </div>
            <div style={grp}>
              <label style={lbl}>Description *</label>
              <textarea name="description" required value={form.description} onChange={handleChange} rows={3} style={{ ...inp, resize: 'vertical' }} placeholder="Detailed description..." />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={lbl}>Selling Price (₹) *</label>
                <input name="price" type="number" required min="0" value={form.price} onChange={handleChange} style={inp} placeholder="4999" />
              </div>
              <div>
                <label style={lbl}>Original / MRP (₹)</label>
                <input name="originalPrice" type="number" min="0" value={form.originalPrice} onChange={handleChange} style={inp} placeholder="6999" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
              <div>
                <label style={lbl}>Average Rating (0-5)</label>
                <input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={handleChange} style={inp} placeholder="4.5" />
              </div>
              <div>
                <label style={lbl}>Review Count</label>
                <input name="reviewCount" type="number" min="0" value={form.reviewCount} onChange={handleChange} style={inp} placeholder="24" />
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <label style={lbl}>Review Description</label>
              <textarea name="reviewDescription" value={form.reviewDescription} onChange={handleChange} rows={2} style={{ ...inp, resize: 'vertical' }} placeholder="Authentic craftsmanship and beautiful drape..." />
            </div>
          </div>

          {/* ── Category & Subcategory ── */}
          <div style={card}>
            <p style={cardTitle}>Category & Stock</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              {/* Parent Category */}
              <div>
                <label style={lbl}>Category *</label>
                <select name="category" required value={form.category} onChange={handleCategoryChange} style={inp}>
                  <option value="">Select category...</option>
                  {parentCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  {allCategories.length === 0 && <option disabled>Loading...</option>}
                </select>
              </div>
              {/* Subcategory — only shown when subcategories exist for selected category */}
              <div>
                <label style={lbl}>
                  Subcategory
                  {subcategories.length === 0 && form.category && (
                    <span style={{ fontWeight: 400, color: '#94a3b8' }}> (none for this category)</span>
                  )}
                </label>
                <select
                  name="subcategory"
                  value={form.subcategory}
                  onChange={handleChange}
                  disabled={subcategories.length === 0}
                  style={{ ...inp, opacity: subcategories.length === 0 ? 0.5 : 1 }}
                >
                  <option value="">Select subcategory...</option>
                  {subcategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={lbl}>Stock Quantity *</label>
              <input name="stockQuantity" type="number" required min="0" value={form.stockQuantity} onChange={handleChange} style={inp} />
            </div>
          </div>

          {/* ── Saree Attributes ── */}
          <div style={card}>
            <p style={cardTitle}>Saree Attributes</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={lbl}>Fabric</label>
                <select name="fabric" value={form.fabric} onChange={handleChange} style={inp}>
                  <option value="">Select Fabric...</option>
                  {FABRIC_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Color</label>
                <select name="color" value={form.color} onChange={handleChange} style={inp}>
                  <option value="">Select Color...</option>
                  {COLOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Occasion</label>
                <select name="occasion" value={form.occasion} onChange={handleChange} style={inp}>
                  <option value="">Select Occasion...</option>
                  {OCCASION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Weave</label>
                <select name="weave" value={form.weave} onChange={handleChange} style={inp}>
                  <option value="">Select Weave...</option>
                  {WEAVE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Border</label>
                <select name="border" value={form.border} onChange={handleChange} style={inp}>
                  <option value="">Select Border...</option>
                  {BORDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Pallu</label>
                <select name="pallu" value={form.pallu} onChange={handleChange} style={inp}>
                  <option value="">Select Pallu...</option>
                  {PALLU_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Blouse</label>
                <select name="blouse" value={form.blouse} onChange={handleChange} style={inp}>
                  <option value="">Select Blouse...</option>
                  {BLOUSE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Badges & Care ── */}
          <div style={{ ...card, marginBottom: 0 }}>
            <p style={cardTitle}>Badges & Care Instructions</p>
            <div style={grp}>
              <label style={lbl}>Badges</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {BADGE_OPTIONS.map(badge => (
                  <button key={badge} type="button" onClick={() => toggleBadge(badge)} style={{
                    padding: '0.35rem 0.875rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 500,
                    cursor: 'pointer', border: '1.5px solid var(--primary)',
                    background: form.badges.includes(badge) ? 'var(--primary)' : 'transparent',
                    color: form.badges.includes(badge) ? 'white' : 'var(--primary)',
                  }}>
                    {badge}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={lbl}>Care Instructions (comma separated)</label>
              <input name="careInstructions" value={form.careInstructions} onChange={handleChange} style={inp}
                placeholder="Dry clean only, Do not bleach, Store in cool place" />
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.5rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.625rem 1.25rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontWeight: 500 }}>
              Cancel
            </button>
            <button type="submit" disabled={saving || uploading} className="btn-primary"
              style={{ padding: '0.625rem 1.5rem', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {saving
                ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</>
                : editProduct ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
