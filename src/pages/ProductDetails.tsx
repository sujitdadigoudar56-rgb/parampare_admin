import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { 
  ArrowLeft, Package, Trash2, Edit, Save, X, ChevronRight, 
  ImagePlus, Loader2, IndianRupee, Tag, Layers, CheckCircle 
} from 'lucide-react';
import { 
  FABRIC_OPTIONS, COLOR_OPTIONS, OCCASION_OPTIONS, WEAVE_OPTIONS, 
  BORDER_OPTIONS, PALLU_OPTIONS, BLOUSE_OPTIONS, BADGE_OPTIONS 
} from '../constants/productOptions';

interface Category {
  _id: string;
  name: string;
  parent: string | null | { _id: string };
  level: number;
}


const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Derived categories
  const parentCategories = allCategories.filter(c =>
    !c.parent || c.parent === null || (typeof c.parent === 'object' && !c.parent._id)
  );

  const subcategories = allCategories.filter(c => {
    if (!editedData?.category || !c.parent) return false;
    const parentId = typeof c.parent === 'object' ? c.parent._id : c.parent;
    return parentId === editedData.category;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catsRes] = await Promise.all([
          api.get(`/products/${id}`),
          api.get('/categories')
        ]);
        
        const prod = prodRes.data.data || prodRes.data;
        const cats = catsRes.data.data || catsRes.data.categories || catsRes.data || [];
        
        setProduct(prod);
        setAllCategories(Array.isArray(cats) ? cats : []);
        
        // Initialize editedData with all possible fields
        setEditedData({
          ...prod,
          category: prod.category?._id || prod.category || '',
          subcategory: prod.subcategory?._id || prod.subcategory || '',
          price: String(prod.price || ''),
          originalPrice: String(prod.originalPrice || ''),
          stockQuantity: String(prod.stockQuantity || 0),
          badges: prod.badges || [],
          careInstructions: (prod.careInstructions || []).join(', '),
          images: prod.images || [],
          rating: String(prod.rating || 0),
          reviewCount: String(prod.reviewCount || 0)
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (editedData.images.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setUploading(true);
    const data = new FormData();
    Array.from(files).forEach(f => data.append('images', f));

    try {
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditedData({ ...editedData, images: [...editedData.images, ...res.data.urls] });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setEditedData({ ...editedData, images: editedData.images.filter((_: any, i: number) => i !== idx) });
  };

  const toggleBadge = (badge: string) => {
    setEditedData({
      ...editedData,
      badges: editedData.badges.includes(badge)
        ? editedData.badges.filter((b: string) => b !== badge)
        : [...editedData.badges, badge]
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...editedData,
        price: Number(editedData.price),
        originalPrice: editedData.originalPrice ? Number(editedData.originalPrice) : undefined,
        stockQuantity: Number(editedData.stockQuantity),
        careInstructions: editedData.careInstructions
          ? editedData.careInstructions.split(',').map((s: string) => s.trim()).filter(Boolean)
          : [],
        rating: Number(editedData.rating),
        reviewCount: Number(editedData.reviewCount)
      };

      await api.put(`/admin/products/${id}`, payload);
      setProduct({ ...payload, category: allCategories.find(c => c._id === payload.category), subcategory: allCategories.find(c => c._id === payload.subcategory) });
      setIsEditing(false);
      alert('Product updated successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error updating product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      navigate('/products');
    } catch (error) {
      alert('Error deleting product');
    }
  };

  if (loading) return <div style={{padding: '4rem', textAlign: 'center'}}>
    <Loader2 size={32} className="spin" style={{margin: '0 auto 1rem', display: 'block'}} />
    Loading product details...
  </div>;

  if (!product) return <div style={{padding: '2rem', textAlign: 'center'}}>Product not found.</div>;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', outline: 'none'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-muted)'
  };

  return (
    <div className="product-details-page">
      <header className="page-header" style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem'}}>
        <button onClick={() => navigate(-1)} style={{background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'}}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>
            <Link to="/products" style={{color: 'inherit'}}>Products</Link>
            <ChevronRight size={14} />
            <span>Product Details</span>
          </div>
          <h1 style={{fontSize: '1.5rem', fontWeight: '700'}}>{product.name}</h1>
        </div>
        <div style={{marginLeft: 'auto', display: 'flex', gap: '1rem'}}>
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="btn-secondary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <X size={18} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving || uploading} className="btn-success" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />} Save Changes
              </button>
            </>
          ) : (
            <>
              <button onClick={handleDelete} className="btn-danger" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Trash2 size={18} /> Delete
              </button>
              <button onClick={() => setIsEditing(true)} className="btn-primary" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Edit size={18} /> Edit Product
              </button>
            </>
          )}
        </div>
      </header>

      {error && (
        <div style={{background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem'}}>
          {error}
        </div>
      )}

      <div style={{display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem'}}>
        {/* Left Column: Images */}
        <div className="product-images-column">
          <section style={{background: 'white', borderRadius: '1rem', padding: '1.5rem', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '2rem'}}>
            <h3 style={{fontSize: '1rem', fontWeight: '600', marginBottom: '1rem'}}>Product Images</h3>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem'}}>
              {isEditing ? (
                <>
                  {editedData.images.map((url: string, i: number) => (
                    <div key={i} style={{position: 'relative', aspectRatio: '1', borderRadius: '0.5rem', border: '1px solid var(--border)', overflow: 'hidden'}}>
                      <img src={url} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      <button onClick={() => removeImage(i)} style={{position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {editedData.images.length < 5 && (
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{aspectRatio: '1', borderRadius: '0.5rem', border: '2px dashed var(--border)', background: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
                      {uploading ? <Loader2 size={20} className="spin" /> : <ImagePlus size={20} />}
                      <span style={{fontSize: '0.625rem'}}>Add</span>
                    </button>
                  )}
                </>
              ) : (
                product.images?.map((url: string, i: number) => (
                  <div key={i} style={{aspectRatio: '1', borderRadius: '0.5rem', border: '1px solid var(--border)', overflow: 'hidden'}}>
                    <img src={url} alt="" style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  </div>
                ))
              )}
            </div>
            <input type="file" ref={fileInputRef} hidden multiple onChange={handleImageUpload} accept="image/*" />

            {/* Main Preview */}
            <div style={{borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid var(--border)', background: '#f8fafc', aspectRatio: '4/5'}}>
              {isEditing ? (
                 editedData.images[0] ? <img src={editedData.images[0]} alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}} /> : <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Package size={48} color="var(--border)" /></div>
              ) : (
                 product.images?.[0] ? <img src={product.images[0]} alt="" style={{width: '100%', height: '100%', objectFit: 'contain'}} /> : <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><Package size={48} color="var(--border)" /></div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Form Fields */}
        <div className="product-info-column">
          <section style={{background: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
            
            {/* Section 1: Basic Info */}
            <div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem'}}>Basic Information</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div>
                  <label style={labelStyle}>Product Name</label>
                  {isEditing ? (
                    <input type="text" value={editedData.name} onChange={(e) => setEditedData({...editedData, name: e.target.value})} style={inputStyle} />
                  ) : (
                    <p style={{fontSize: '1.25rem', fontWeight: '600'}}>{product.name}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  {isEditing ? (
                    <textarea value={editedData.description} onChange={(e) => setEditedData({...editedData, description: e.target.value})} rows={5} style={{...inputStyle, resize: 'vertical'}} />
                  ) : (
                    <p style={{lineHeight: '1.6', color: 'var(--text-main)'}}>{product.description}</p>
                  )}
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                  <div>
                    <label style={labelStyle}>Selling Price (₹)</label>
                    {isEditing ? (
                      <input type="number" value={editedData.price} onChange={(e) => setEditedData({...editedData, price: e.target.value})} style={inputStyle} />
                    ) : (
                      <p style={{fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)'}}>₹{Number(product.price).toLocaleString()}</p>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Original / MRP (₹)</label>
                    {isEditing ? (
                      <input type="number" value={editedData.originalPrice} onChange={(e) => setEditedData({...editedData, originalPrice: e.target.value})} style={inputStyle} />
                    ) : (
                      <p style={{fontSize: '1.125rem', color: 'var(--text-muted)', textDecoration: 'line-through'}}>₹{Number(product.originalPrice || 0).toLocaleString()}</p>
                    )}
                  </div>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem'}}>
                  <div>
                    <label style={labelStyle}>Average Rating (0-5)</label>
                    {isEditing ? (
                      <input type="number" step="0.1" min="0" max="5" value={editedData.rating} onChange={(e) => setEditedData({...editedData, rating: e.target.value})} style={inputStyle} />
                    ) : (
                      <p style={{fontSize: '1.125rem', fontWeight: '600'}}>{product.rating || 0} / 5</p>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Review Count</label>
                    {isEditing ? (
                      <input type="number" min="0" value={editedData.reviewCount} onChange={(e) => setEditedData({...editedData, reviewCount: e.target.value})} style={inputStyle} />
                    ) : (
                      <p style={{fontSize: '1.125rem'}}>{product.reviewCount || 0} reviews</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Category & Stock */}
            <div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem'}}>Category & Stock</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                <div>
                  <label style={labelStyle}>Category</label>
                  {isEditing ? (
                    <select value={editedData.category} onChange={(e) => setEditedData({...editedData, category: e.target.value, subcategory: ''})} style={inputStyle}>
                      <option value="">Select Category</option>
                      {parentCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  ) : (
                    <p>{product.category?.name || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Subcategory</label>
                  {isEditing ? (
                    <select value={editedData.subcategory} onChange={(e) => setEditedData({...editedData, subcategory: e.target.value})} disabled={subcategories.length === 0} style={{...inputStyle, opacity: subcategories.length === 0 ? 0.5 : 1}}>
                      <option value="">Select Subcategory</option>
                      {subcategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  ) : (
                    <p>{product.subcategory?.name || 'None'}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Stock Quantity</label>
                  {isEditing ? (
                    <input type="number" value={editedData.stockQuantity} onChange={(e) => setEditedData({...editedData, stockQuantity: e.target.value})} style={inputStyle} />
                  ) : (
                    <span className={`badge badge-${product.stockQuantity > 0 ? 'success' : 'danger'}`}>
                      {product.stockQuantity} in stock
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Saree Attributes */}
            <div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem'}}>Saree Attributes</h3>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                <div>
                  <label style={labelStyle}>Fabric</label>
                  {isEditing ? (
                    <select value={editedData.fabric || ''} onChange={(e) => setEditedData({...editedData, fabric: e.target.value})} style={inputStyle}>
                      <option value="">Select Fabric...</option>
                      {FABRIC_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <p>{product.fabric || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Color</label>
                  {isEditing ? (
                    <select value={editedData.color || ''} onChange={(e) => setEditedData({...editedData, color: e.target.value})} style={inputStyle}>
                      <option value="">Select Color...</option>
                      {COLOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <p>{product.color || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Occasion</label>
                  {isEditing ? (
                    <select value={editedData.occasion || ''} onChange={(e) => setEditedData({...editedData, occasion: e.target.value})} style={inputStyle}>
                      <option value="">Select Occasion...</option>
                      {OCCASION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <p>{product.occasion || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Weave</label>
                  {isEditing ? (
                    <select value={editedData.weave || ''} onChange={(e) => setEditedData({...editedData, weave: e.target.value})} style={inputStyle}>
                      <option value="">Select Weave...</option>
                      {WEAVE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <p>{product.weave || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Border</label>
                  {isEditing ? (
                    <select value={editedData.border || ''} onChange={(e) => setEditedData({...editedData, border: e.target.value})} style={inputStyle}>
                      <option value="">Select Border...</option>
                      {BORDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <p>{product.border || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Pallu</label>
                  {isEditing ? (
                    <select value={editedData.pallu || ''} onChange={(e) => setEditedData({...editedData, pallu: e.target.value})} style={inputStyle}>
                      <option value="">Select Pallu...</option>
                      {PALLU_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <p>{product.pallu || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Blouse</label>
                  {isEditing ? (
                    <select value={editedData.blouse || ''} onChange={(e) => setEditedData({...editedData, blouse: e.target.value})} style={inputStyle}>
                      <option value="">Select Blouse...</option>
                      {BLOUSE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <p>{product.blouse || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Badges & Care */}
            <div>
              <h3 style={{fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem'}}>Badges & Care</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                <div>
                  <label style={labelStyle}>Badges</label>
                  {isEditing ? (
                    <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                      {BADGE_OPTIONS.map(badge => (
                        <button key={badge} onClick={() => toggleBadge(badge)} style={{
                          padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid var(--primary)', 
                          background: editedData.badges.includes(badge) ? 'var(--primary)' : 'white',
                          color: editedData.badges.includes(badge) ? 'white' : 'var(--primary)',
                          cursor: 'pointer', transition: 'all 0.2s'
                        }}>
                          {badge}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      {product.badges?.map((b: string) => <span key={b} className="badge badge-warning">{b}</span>) || 'None'}
                    </div>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Care Instructions (comma separated)</label>
                  {isEditing ? (
                    <input type="text" value={editedData.careInstructions} onChange={(e) => setEditedData({...editedData, careInstructions: e.target.value})} placeholder="e.g. Dry clean only, Do not bleach" style={inputStyle} />
                  ) : (
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                      {product.careInstructions?.map((ci: string, i: number) => <span key={i} style={{padding: '4px 12px', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.875rem'}}>{ci}</span>) || 'None'}
                    </div>
                  )}
                </div>
              </div>
            </div>

          </section>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
