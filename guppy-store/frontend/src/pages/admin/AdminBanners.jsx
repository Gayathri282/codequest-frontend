import { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Upload, Pencil, X, Check, Monitor, Smartphone } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { title: '', subtitle: '', link: '/', order: 0 };

function ImagePicker({ label, icon: Icon, current, file, preview, onFile, hint }) {
  const ref = useRef();
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
        <Icon size={12} /> {label}
      </label>
      {/* Current image */}
      {(preview || current) && (
        <div className="relative mb-2 rounded-xl overflow-hidden bg-slate-100" style={{ aspectRatio: '16/6' }}>
          <img src={preview || current} alt={label} className="w-full h-full object-cover" />
          {preview && <span className="absolute top-1 right-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">New</span>}
        </div>
      )}
      <label className="flex items-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-3 cursor-pointer hover:border-primary-400 transition">
        <Upload size={14} className="text-slate-400 flex-shrink-0" />
        <span className="text-xs text-slate-500 truncate">{file ? file.name : (current ? 'Replace image' : 'Upload image')}</span>
        <input ref={ref} type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={onFile} />
      </label>
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminBanners() {
  const [banners,  setBanners]  = useState([]);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [desktop,  setDesktop]  = useState({ file: null, preview: '' });
  const [mobile,   setMobile]   = useState({ file: null, preview: '' });
  const [loading,  setLoading]  = useState(false);

  // Edit state
  const [editId,   setEditId]   = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editDesk, setEditDesk] = useState({ file: null, preview: '' });
  const [editMob,  setEditMob]  = useState({ file: null, preview: '' });
  const [saving,   setSaving]   = useState(false);

  const load = () => api.get('/admin/banners').then(r => setBanners(r.data));
  useEffect(() => { load(); }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const pickFile = (setter) => (e) => {
    const f = e.target.files[0];
    if (f) setter({ file: f, preview: URL.createObjectURL(f) });
  };

  // ── Add ──────────────────────────────────────────────────────────────────────
  const submit = async (e) => {
    e.preventDefault();
    if (!desktop.file) { toast.error('Upload a desktop banner image'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('image', desktop.file);
      if (mobile.file) fd.append('image_mobile', mobile.file);
      await api.post('/admin/banners', fd);
      toast.success('Banner added');
      setForm(EMPTY_FORM);
      setDesktop({ file: null, preview: '' });
      setMobile({ file: null, preview: '' });
      load();
    } catch { toast.error('Upload failed'); }
    finally   { setLoading(false); }
  };

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const startEdit = (b) => {
    setEditId(b._id);
    setEditForm({ title: b.title, subtitle: b.subtitle, link: b.link, order: b.order ?? 0 });
    setEditDesk({ file: null, preview: '' });
    setEditMob({ file: null, preview: '' });
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
      if (editDesk.file) fd.append('image', editDesk.file);
      if (editMob.file)  fd.append('image_mobile', editMob.file);
      await api.patch(`/admin/banners/${editId}`, fd);
      toast.success('Banner updated');
      setEditId(null);
      load();
    } catch { toast.error('Update failed'); }
    finally   { setSaving(false); }
  };

  const del = async (id) => {
    if (!confirm('Delete this banner?')) return;
    await api.delete(`/admin/banners/${id}`);
    toast.success('Deleted');
    load();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-ocean mb-6">Banners</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Add form ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-ocean mb-4 flex items-center gap-2">
            <Plus size={16} className="text-primary-500" /> Add New Banner
          </h2>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Title</label>
                <input className="input" value={form.title} onChange={set('title')} placeholder="e.g. Premium Guppy Fish" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-500 mb-1 block">Subtitle</label>
                <input className="input" value={form.subtitle} onChange={set('subtitle')} placeholder="Short tagline" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Link (URL)</label>
                <input className="input" value={form.link} onChange={set('link')} placeholder="/breed/fancy-guppy" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Display Order</label>
                <input type="number" className="input" value={form.order} onChange={set('order')} min={0} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <ImagePicker
                label="Desktop Image *" icon={Monitor}
                current="" file={desktop.file} preview={desktop.preview}
                onFile={pickFile(setDesktop)}
                hint="Recommended: 1400×500px"
              />
              <ImagePicker
                label="Mobile Image (optional)" icon={Smartphone}
                current="" file={mobile.file} preview={mobile.preview}
                onFile={pickFile(setMobile)}
                hint="Recommended: 800×600px"
              />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition">
              <Plus size={15} /> {loading ? 'Uploading…' : 'Add Banner'}
            </button>
          </form>
        </div>

        {/* ── Existing banners ── */}
        <div className="space-y-4">
          <h2 className="font-semibold text-ocean">Existing Banners ({banners.length})</h2>
          {banners.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-12">No banners yet</p>
          )}

          {banners.map(b => (
            <div key={b._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Preview row */}
              <div className="relative bg-slate-100" style={{ aspectRatio: '16/5' }}>
                {b.image ? (
                  <img src={b.image} alt={b.title || 'Banner'} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-r ${b.gradient || 'from-primary-800 to-cyan-700'}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-end px-4 pb-2">
                  <div>
                    <p className="text-white font-semibold text-sm drop-shadow line-clamp-1">{b.title || '(No title)'}</p>
                    {b.subtitle && <p className="text-white/70 text-xs">{b.subtitle}</p>}
                  </div>
                </div>
                {b.imageMobile && (
                  <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2 py-0.5 flex items-center gap-1">
                    <Smartphone size={10} className="text-white" />
                    <span className="text-white text-[10px] font-medium">Mobile set</span>
                  </div>
                )}
              </div>

              {/* Edit panel or action row */}
              {editId === b._id ? (
                <div className="p-4 space-y-3 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-[10px] font-medium text-slate-400 mb-1 block">Title</label>
                      <input className="input text-xs" value={editForm.title}
                        onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-medium text-slate-400 mb-1 block">Subtitle</label>
                      <input className="input text-xs" value={editForm.subtitle}
                        onChange={e => setEditForm(f => ({ ...f, subtitle: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 mb-1 block">Link</label>
                      <input className="input text-xs" value={editForm.link}
                        onChange={e => setEditForm(f => ({ ...f, link: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 mb-1 block">Order</label>
                      <input type="number" className="input text-xs" value={editForm.order}
                        onChange={e => setEditForm(f => ({ ...f, order: e.target.value }))} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <ImagePicker
                      label="Desktop Image" icon={Monitor}
                      current={b.image} file={editDesk.file} preview={editDesk.preview}
                      onFile={pickFile(setEditDesk)} hint="Leave blank to keep current"
                    />
                    <ImagePicker
                      label="Mobile Image" icon={Smartphone}
                      current={b.imageMobile} file={editMob.file} preview={editMob.preview}
                      onFile={pickFile(setEditMob)} hint="Leave blank to keep current"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2.5 rounded-xl transition">
                      <Check size={13} /> {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button onClick={() => setEditId(null)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold py-2.5 rounded-xl transition">
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-2.5 flex items-center justify-between border-t border-slate-50">
                  <span className="text-xs text-slate-400 truncate max-w-[60%]">{b.link}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => startEdit(b)}
                      className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-primary-600 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => del(b._id)}
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
