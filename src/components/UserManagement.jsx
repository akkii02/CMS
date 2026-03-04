import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Search, ShieldAlert, DollarSign, Crown, UserCheck, Plus } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [creditModal, setCreditModal] = useState({ open: false, userId: null, addAmount: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspendToggle = async (id) => {
        try {
            await api.put(`/api/admin/users/${id}/suspend`);
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handlePlanToggle = async (id, currentPlan) => {
        try {
            const newPlan = currentPlan === 'free' ? 'premium' : 'free';
            await api.put(`/api/admin/users/${id}/plan`, { plan: newPlan });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddCredits = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/admin/users/${creditModal.userId}/add-credits`, { credits: creditModal.addAmount });
            setCreditModal({ open: false, userId: null, addAmount: '' });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

    return (
        <div className="p-4 sm:p-8 md:p-12 mb-20 max-w-7xl mx-auto animate-fade-in w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-gray-900 mb-2">User Registry</h1>
                    <p className="text-gray-500 font-medium">Manage platform tenants, credits, and access.</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white border border-gray-200 shadow-sm pl-11 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Impact</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-gray-900">{users.length}</span>
                        <span className="text-xs font-bold text-gray-400 mb-1">Accounts</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Now</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-emerald-600">{users.filter(u => u.status === 'active').length}</span>
                        <span className="text-xs font-bold text-gray-400 mb-1">Users</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">System Economy</p>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-primary">{users.reduce((acc, u) => acc + (u.credits || 0), 0)}</span>
                        <span className="text-xs font-bold text-gray-400 mb-1">Total Credits</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_24px_rgb(0,0,0,0.03)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-500">User</th>
                                <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-500">Credits</th>
                                <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-500">Plan</th>
                                <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-500">Status</th>
                                <th className="py-4 px-6 font-semibold text-xs uppercase tracking-wider text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {u.name?.charAt(0) || u.email?.substring(0, 1).toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900">{u.name || 'Anonymous'}</span>
                                                <span className="text-xs text-gray-500">{u.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-xl text-primary">{u.credits}</span>
                                            <button
                                                onClick={() => setCreditModal({ open: true, userId: u._id, addAmount: '10' })}
                                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 text-primary hover:bg-primary text-[10px] font-black uppercase tracking-tighter rounded-lg hover:text-white transition-all shadow-sm active:scale-95"
                                                title="Recharge Credits"
                                            >
                                                <Plus size={12} /> Add
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={() => handlePlanToggle(u._id, u.plan)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.plan === 'premium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
                                        >
                                            <Crown size={12} /> {u.plan}
                                        </button>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.status === 'suspended' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => handleSuspendToggle(u._id)}
                                            className={`p-2 rounded-xl transition-colors ${u.status === 'suspended' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-red-500 hover:bg-red-50'}`}
                                            title={u.status === 'suspended' ? "Unsuspend Account" : "Suspend Account"}
                                        >
                                            {u.status === 'suspended' ? <UserCheck size={18} /> : <ShieldAlert size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Credits Modal */}
            {creditModal.open && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-slide-up shadow-2xl border border-border/50">
                        <h3 className="text-xl font-bold text-textMain mb-4">Add Credits</h3>
                        <form onSubmit={handleAddCredits}>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-textMain mb-1.5">Amount to Add</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={creditModal.addAmount}
                                    onChange={(e) => setCreditModal({ ...creditModal, addAmount: e.target.value })}
                                    className="w-full bg-surfaceHover border border-border px-4 py-2 rounded-xl text-textMain focus:outline-none focus:border-primary transition-colors"
                                    required
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <button type="button" onClick={() => setCreditModal({ open: false, userId: null, addAmount: '' })} className="px-4 py-2 rounded-xl font-bold text-textMuted bg-surfaceHover hover:bg-border transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-xl font-bold text-white bg-primary hover:bg-primaryHover shadow-md transition-colors">Add Credits</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
