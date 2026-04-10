import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, ChevronLeft } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { BREEDS } from '../../utils/breeds';

const BLANK = {
  name: '', breed: '', breedSlug: '', description: '',
  price: '', stock: '', gender: 'unsexed', age: '', size: '', color: '',
  isFeatured: false, isActive: true,
};

export default function AddProduct() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = !!id;

  const [form,    setForm]    = useState(BLANK);
  const [files,   setFiles]   = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then(r => {
        const p = r.data;
        setForm({ ...BLANK, ...p, price: String(p.price), stock: String(p.stock) });
        setPreview(p.images || []);
      });
    }
  }, [id]);

  const set = k => e => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => {
      const next = { ...f, [k]: val };
      // Auto-fill breedSlug from BREEDS list
      if (k === 'breed') {
        const match = BREEDS.find(b => b.name === val);
        if (match) next.breedSlug = match.slug;
        else next.breedSlug = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      }
      return next;
    });
  };

  const onFiles = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreview(selected.map(f => URL.createObjectURL(f)));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.breedSlug) { toast.error('Breed slug required'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      files.forEach(f => fd.append('images', f));

      if (isEdit) await api.put(`/products/${id}`, fd);
      else        await api.post('/products', fd);

      toast.success(isEdit ? 'Product updated' : 'Product added');
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/admin/products')}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary-600 mb-6">
        <ChevronLeft size={16} /> Back to Products
      </button>
      <h1 className="text-2xl font-bold text-ocean mb-6">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={submit} className="card p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Product Name *</label>
          <input className="input" required value={form.name} onChange={set('name')} placeholder="e.g. Neon Blue Cobra Male" />
        </div>

        {/* Breed */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Breed *</label>
            <select className="input" required value={form.breed} onChange={set('breed')}>
              <option value="">Select breed</option>
              {BREEDS.map(b => <option key={b.slug} value={b.name}>{b.name}</option>)}
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Breed Slug *</label>
            <input className="input" required value={form.breedSlug} onChange={set('breedSlug')} placeholder="e.g. cobra-guppy" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Description *</label>
          <textarea className="input resize-none h-24" required value={form.description} onChange={set('description')} />
        </div>

        {/* Price / Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Price (₹) *</label>
            <input type="number" className="input" required min={1} value={form.price} onChange={set('price')} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Stock *</label>
            <input type="number" className="input" required min={0} value={form.stock} onChange={set('stock')} />
          </div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Gender</label>
            <select className="input" value={form.gender} onChange={set('gender')}>
              {['male','female','pair','unsexed'].map(g => <option key={g} className="capitalize">{g}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Age</label>
            <input className="input" value={form.age} onChange={set('age')} placeholder="2-3 months" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Size</label>
            <input className="input" value={form.size} onChange={set('size')} placeholder="1.5 inch" />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Color / Pattern</label>
          <input className="input" value={form.color} onChange={set('color')} placeholder="e.g. Neon Blue with Red Tail" />
        </div>

        {/* Images */}
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">Images (JPG / PNG, max 6)</label>
          <label className="flex items-center gap-3 border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-primary-400 transition">
            <Upload size={20} className="text-slate-400" />
            <span className="text-sm text-slate-500">Click to upload images</span>
            <input type="file" className="hidden" multiple accept="image/jpeg,image/png,image/webp" onChange={onFiles} />
          </label>
          {preview.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {preview.map((src, i) => (
                <div key={i} className="w-20 h-20 rounded-lg overflow-hidden relative group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flags */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" className="accent-primary-500" checked={form.isFeatured} onChange={set('isFeatured')} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" className="accent-primary-500" checked={form.isActive} onChange={set('isActive')} />
            Active (visible)
          </label>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Saving…' : (isEdit ? 'Update Product' : 'Add Product')}
        </button>
      </form>
    </div>
  );
}
