import { useEffect, useState } from 'react';
import { Trash2, Search } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  const fetch = () => {
    api.get('/admin/users').then(r => setUsers(r.data.users || [])).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const deleteUser = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = search
    ? users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ocean">Users</h1>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-8 w-52 text-sm"
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse text-primary-500">Loading…</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'Email', 'Phone', 'Role', 'Verified', 'Joined', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-ocean">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-slate-500">{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge capitalize ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.isEmailVerified && <span className="badge bg-green-100 text-green-700">Email</span>}
                      {u.isPhoneVerified && <span className="badge bg-blue-100 text-blue-700">Phone</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <button onClick={() => deleteUser(u._id, u.name)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-slate-400 py-8">No users found</p>
          )}
        </div>
      )}
    </div>
  );
}
