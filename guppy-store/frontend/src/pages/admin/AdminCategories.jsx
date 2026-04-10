import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Upload, Pencil, X, Check, Tag } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const GRADIENTS = [
  { value: 'from-violet-400 via-purple-500 to-pink-500',   label: 'Purple' },
  { value: 'from-yellow-400 via-orange-500 to-red-500',    label: 'Orange' },
  { value: 'from-blue-400 via-cyan-500 to-teal-500',       label: 'Cyan'   },
  { value: 'from-green-400 via-emerald-500 to-cyan-500',   label: 'Green'  },
  { value: 'from-sky-400 via-blue-500 to-indigo-500',      label: 'Blue'   },
  { value: 'from-rose-400 via-pink-500 to-fuchsia-500',    label: 'Rose'   },
  { value: 'from-red-400 via-rose-500 to-pink-400',        label: 'Red'    },
  { value: 'from-blue-600 via-blue-500 to-cyan-400',       label: 'Navy'   },
];

const EMPTY = { name: '', slug: '', tagline: '', gradient: GRADIENTS[0].value, emoji: '', order: 0 };

function GradientPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {GRADIENTS.map(g => (
        <button key={g.value} type="button" title={g.label}
          onClick={() => onChange(g.value)}
          className={`h-7 rounded-lg bg-gradient-to-r ${g.value} transition-all ${value === g.value ? 'ring-2 ring-offset-1 ring-ocean scale-110' : 'opacity-60 hover:opacity-100'}`}
        />
      ))}
    </div>
  );
}

function ImageUploadBox({ current, file, preview, onFile, replacing }) {
  const ref = useRef();
  return (
    <div>
      {(preview || current) && (
        <div className="relative rounded-xl overflow-hidden mb-2" style={{ aspectRatio: '16/9' }}>
          <img src={preview || current} alt="Category" className="w-full h-full object-cover" />
          {preview && (
            <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>
          )}
        </div>
      )}
      <label className="flex items-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-3 cursor-pointer hover:border-primary-400 transition">
        <Upload size={14} className="text-slate-400 flex-shrink-0" />
        <span className="text-xs text-slate-500 truncate">
          {file ? file.name : current ? 'Replace image' : 'Upload category image (optional)'}
        </span>
        <input ref={ref} type="file" className="hidden" accept="image/jpeg,image/png,image/webp"
          onChange={e => { const f = e.target.files[0]; if (f) onFile(f, URL.createObjectURL(f)); }} />
      </label>
      {current && !preview && (
        <p className="text-[10px] text-slate-400 mt-1">Image set — upload new to replace</p>
      )}
    </div>
  );
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form,    setForm]    = useState(EMPTY);
  const [imgFile, setImgFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const [editId,   setEditId]   = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editFile, setEditFile] = useState(null);
  const [editPrev, setEditPrev] = useState('');
  const [saving,   setSaving]   = useState(false);

  const load = () => api.get('/admin/categories').then(r => setCategories(r.data));
  useEffect(() => { load(); }, []);

  const set = k => e => {
    const v = e.target.value;
    setForm(f => {
      const next = { ...f, [k]: v };
      if (k === 'name') next.slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return next;
    });
  };

  // ── Add ──────────────────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imgFile) fd.append('image', imgFile);
      await api.post('/admin/categories', fd);
      toast.success('Category added');
      setForm(EMPTY); setImgFile(null); setPreview('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const startEdit = (cat) => {
    setEditId(cat._id);
    setEditForm({ name: cat.name, slug: cat.slug, tagline: cat.tagline || '', gradient: cat.gradient || GRADIENTS[0].value, emoji: cat.emoji || '', order: cat.order ?? 0 });
    setEditFile(null); setEditPrev('');
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
      if (editFile) fd.append('image', editFile);
      await api.patch(`/admin/categories/${editId}`, fd);
      toast.success('Category updated');
      setEditId(null);
      load();
    } catch { toast.error('Update failed'); }
    finally   { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this category? Products in this breed will not be affected.')) return;
    await api.delete(`/admin/categories/${id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ocean mb-2">Categories</h1>
      <p className="text-sm text-slate-500 mb-6">
        These appear as "Shop by Breed" cards on the homepage. Upload a real guppy photo for best results.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Add form ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-ocean mb-4 flex items-center gap-2">
            <Tag size={15} className="text-primary-500" /> Add Category
          </h2>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Name *</label>
                <input className="input" required value={form.name} onChange={set('name')} placeholder="e.g. Fancy Guppy" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Slug *</label>
                <input className="input font-mono text-xs" required value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="fancy-guppy" />
                <p className="text-[10px] text-slate-400 mt-0.5">Auto-filled. Used in URL: /breed/slug</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Tagline</label>
                <input className="input" value={form.tagline} onChange={set('tagline')} placeholder="Short description" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Emoji</label>
                <input className="input text-center text-xl" value={form.emoji} onChange={set('emoji')} placeholder="🐟" maxLength={4} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Display Order</label>
                <input type="number" className="input" value={form.order} onChange={set('order')} min={0} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 mb-1.5 block">Fallback Gradient (shown when no image)</label>
              <GradientPicker value={form.gradient} onChange={v => setForm(f => ({ ...f, gradient: v }))} />
            </div>

            <ImageUploadBox
              current="" file={imgFile} preview={preview}
              onFile={(f, p) => { setImgFile(f); setPreview(p); }}
            />

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition">
              <Plus size={15} /> {loading ? 'Adding…' : 'Add Category'}
            </button>
          </form>
        </div>

        {/* ── List ── */}
        <div className="space-y-3">
          <h2 className="font-semibold text-ocean">All Categories ({categories.length})</h2>
          {categories.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-12">No categories yet</p>
          )}

          {categories.map(cat => (
            <div key={cat._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Visual preview */}
              <div className={`relative h-28 ${!cat.image ? `bg-gradient-to-r ${cat.gradient}` : ''}`}>
                {cat.image
                  ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  : (
                    <div className="w-full h-full flex items-center justify-center gap-2">
                      <span className="text-3xl">{cat.emoji}</span>
                    </div>
                  )
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end px-3 pb-2">
                  <div>
                    <p className="text-white font-bold text-sm drop-shadow">{cat.name}</p>
                    {cat.tagline && <p className="text-white/70 text-xs">{cat.tagline}</p>}
                  </div>
                </div>
              </div>

              {/* Edit panel or actions */}
              {editId === cat._id ? (
                <div className="p-4 space-y-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                      <label className="text-[10px] font-medium text-slate-400 mb-1 block">Name</label>
                      <input className="input text-xs" value={editForm.name}
                        onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-medium text-slate-400 mb-1 block">Slug</label>
                      <input className="input font-mono text-xs" value={editForm.slug}
                        onChange={e => setEditForm(f => ({ ...f, slug: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-medium text-slate-400 mb-1 block">Tagline</label>
                      <input className="input text-xs" value={editForm.tagline}
                        onChange={e => setEditForm(f => ({ ...f, tagline: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 mb-1 block">Emoji</label>
                      <input className="input text-xs text-center text-xl" value={editForm.emoji} maxLength={4}
                        onChange={e => setEditForm(f => ({ ...f, emoji: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 mb-1 block">Order</label>
                      <input type="number" className="input text-xs" value={editForm.order}
                        onChange={e => setEditForm(f => ({ ...f, order: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-slate-400 mb-1.5 block">Gradient</label>
                    <GradientPicker value={editForm.gradient} onChange={v => setEditForm(f => ({ ...f, gradient: v }))} />
                  </div>

                  <ImageUploadBox
                    current={cat.image} file={editFile} preview={editPrev}
                    onFile={(f, p) => { setEditFile(f); setEditPrev(p); }}
                  />

                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2.5 rounded-xl transition">
                      <Check size={13} /> {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button onClick={() => setEditId(null)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold py-2.5 rounded-xl transition">
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2.5 flex items-center justify-between border-t border-slate-50">
                  <code className="text-[10px] text-slate-400">/breed/{cat.slug}</code>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(cat)}
                      className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-primary-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => del(cat._id)}
                      className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-red-500 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
