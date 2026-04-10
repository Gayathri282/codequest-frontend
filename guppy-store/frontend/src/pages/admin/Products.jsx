import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get('/products?limit=100').then(r => setProducts(r.data.products || [])).finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const deleteProduct = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Deleted');
      fetch();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ocean">Products</h1>
        <Link to="/admin/products/add" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="animate-pulse text-primary-500">Loading…</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-slate-300" />
          <p className="text-slate-500 mt-3">No products yet</p>
          <Link to="/admin/products/add" className="btn-primary inline-block mt-4">Add First Product</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Product', 'Breed', 'Price', 'Stock', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-slate-500 font-medium text-xs">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(p => (
                <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">🐟</div>
                        }
                      </div>
                      <span className="font-medium text-ocean line-clamp-1">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{p.breed}</td>
                  <td className="px-4 py-3 font-medium">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.stock < 1 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/products/edit/${p._id}`}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-primary-600 transition-colors">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => deleteProduct(p._id, p.name)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
