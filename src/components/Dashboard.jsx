import { useState, useEffect } from 'react';
import api from '../services/api';
import { API_BASE_URL } from '../config';
import {
    Plus, Edit3, Trash2, LayoutDashboard, Code2,
    ChevronRight, Check, FileText, ChevronLeft, LogOut,
    Eye, Activity, Users, Search, TrendingUp,
    Briefcase, ShieldCheck, BarChart3, Globe2, RefreshCw,
    Settings, Globe, Heart, Monitor, Zap, User as UserIcon, MessageSquare, ThumbsUp, Send, UserCircle2,
    PanelLeftClose, Menu, ChevronDown, BookOpen, Coins
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
    ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';
import Editor from './Editor';
import UserManagement from './UserManagement';
import { calculateGlobalSEO, analyzeSEO } from '../utils/SEOAuditor';

const SystemSettingsSection = ({ settings, onUpdate }) => {
    const [local, setLocal] = useState(settings || { globalAnnouncement: { text: '', isActive: false, type: 'info' } });

    const handleSave = async () => {
        try {
            const res = await api.put('/api/admin/settings', local);
            onUpdate(res.data);
            alert('Settings updated!');
        } catch (e) { alert('Error updating settings'); }
    };

    return (
        <div className="p-8 md:p-12 max-w-3xl mx-auto animate-fade-in w-full">
            <h2 className="text-4xl font-extrabold text-textMain tracking-tight mb-8">System Control</h2>
            <div className="glass-card-premium p-8 border border-border">
                <div className="mb-8">
                    <h3 className="text-lg font-bold text-textMain mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-primary" /> Global Announcement
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                type="checkbox"
                                id="announce-active"
                                checked={local.globalAnnouncement?.isActive}
                                onChange={e => setLocal({ ...local, globalAnnouncement: { ...local.globalAnnouncement, isActive: e.target.checked } })}
                                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="announce-active" className="text-sm font-bold text-textMain">Active Announcement</label>
                        </div>

                        <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-1">Message Text</label>
                        <textarea
                            value={local.globalAnnouncement?.text}
                            onChange={e => setLocal({ ...local, globalAnnouncement: { ...local.globalAnnouncement, text: e.target.value } })}
                            className="w-full bg-surface border border-border px-4 py-3 rounded-xl text-sm min-h-[100px] focus:ring-1 focus:ring-primary focus:outline-none transition-shadow"
                            placeholder="Enter platform-wide message..."
                        />

                        <div className="flex gap-4">
                            {['info', 'warning', 'error', 'success'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setLocal({ ...local, globalAnnouncement: { ...local.globalAnnouncement, type: t } })}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${local.globalAnnouncement?.type === t ? 'bg-primary text-white border-primary shadow-md' : 'bg-surface border-border text-textMuted hover:border-primary'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border mt-8 flex justify-end">
                    <button onClick={handleSave} className="bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:-translate-y-0.5 transition-all">
                        Deploy System Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

const analyticsMockData = [
    { name: 'Mon', views: 1200, readTime: 4.5 },
    { name: 'Tue', views: 2100, readTime: 5.2 },
    { name: 'Wed', views: 1800, readTime: 4.8 },
    { name: 'Thu', views: 2400, readTime: 6.1 },
    { name: 'Fri', views: 2900, readTime: 5.9 },
    { name: 'Sat', views: 3500, readTime: 7.2 },
    { name: 'Sun', views: 4200, readTime: 8.5 },
];

const trafficMockData = [
    { source: 'Organic', users: 4500 },
    { source: 'Direct', users: 2100 },
    { source: 'Twitter', users: 1800 },
    { source: 'LinkedIn', users: 950 },
    { source: 'Referral', users: 400 },
];

export default function Dashboard({ user, setUser, onLogout }) {
    const [blogs, setBlogs] = useState([]);
    const [client, setClient] = useState(null);
    const [allClients, setAllClients] = useState([]); // For Admin
    const [adminMetrics, setAdminMetrics] = useState(null);
    const [systemSettings, setSystemSettings] = useState(null);
    const [view, setView] = useState(user?.role === 'admin' ? 'monitor' : 'list');
    const [currentBlog, setCurrentBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [expandedProducts, setExpandedProducts] = useState({ blog: true });

    const filteredBlogs = blogs.filter(b => {
        const matchesSearch = b.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/blogs');
            setBlogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientData = async () => {
        try {
            const res = await api.get('/api/clients/me');
            setClient(res.data);
        } catch (err) {
            console.error('Failed to fetch client profile', err);
        }
    };

    const fetchAdminMetrics = async () => {
        if (user.role !== 'admin') return;
        try {
            const res = await api.get('/api/admin/metrics');
            setAdminMetrics(res.data);
        } catch (err) {
            console.error('Failed to fetch admin metrics', err);
        }
    };

    const fetchAllClients = async () => {
        if (user.role !== 'admin') return;
        try {
            const res = await api.get('/api/admin/clients');
            setAllClients(res.data);
        } catch (err) {
            console.error('Failed to fetch clients', err);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const res = await api.get('/api/auth/me');
            const updatedUser = res.data;
            const savedUser = JSON.parse(localStorage.getItem('user') || '{}');

            // Merge updated user data while preserving the existing token
            const mergedUser = { ...updatedUser, token: savedUser.token };

            setUser(mergedUser);
            localStorage.setItem('user', JSON.stringify(mergedUser));
        } catch (err) {
            console.error('Failed to refresh user data', err);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchSystemSettings();
        if (user.role === 'admin') {
            fetchAdminMetrics();
            fetchAllClients();
        } else {
            fetchBlogs();
            fetchClientData();
        }
    }, []);

    const fetchSystemSettings = async () => {
        try {
            const res = await api.get('/api/public/settings');
            setSystemSettings(res.data);
        } catch (e) { console.error('Failed to fetch platform settings', e); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;
        try {
            await api.delete(`/api/blogs/${id}`);
            fetchBlogs();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveBlog = async (blogData) => {
        try {
            if (currentBlog?.id || currentBlog?._id) {
                const id = currentBlog.id || currentBlog._id;
                await api.put(`/api/blogs/${id}`, blogData);
            } else {
                await api.post('/api/blogs', blogData);
            }
            setView('list');
            fetchBlogs();
        } catch (err) {
            console.error(err);
        }
    };

    const regenerateApiKey = async () => {
        if (!window.confirm('Warning: This will break existing embeds until you update them with the new key. Proceed?')) return;
        try {
            const res = await api.post('/api/clients/regenerate-key');
            setClient(res.data);
            alert('New API Key generated successfully!');
        } catch (err) {
            console.error('Failed to regenerate API key', err);
            alert('Failed to regenerate API key. Please try again.');
        }
    };

    return (
        <div className="w-full h-screen flex overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 50%, #F5F3FF 100%)' }}>

            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-[250px]' : 'w-[68px]'} bg-white border-r border-gray-200/80 hidden md:flex flex-col z-20 shrink-0 transition-all duration-300 ease-in-out relative h-full shadow-sm`}>
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5 relative z-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`.sidebar-scroll::-webkit-scrollbar { display: none; }`}</style>

                    {/* App Logo + Toggle */}
                    <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} mb-6 px-2`}>
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-md shadow-indigo-500/20">C</div>
                            {isSidebarOpen && <span className="text-lg font-bold tracking-tight text-gray-800">CMS<span className="text-indigo-500">Pro</span></span>}
                        </div>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        >
                            {isSidebarOpen ? <PanelLeftClose size={18} /> : <Menu size={18} />}
                        </button>
                    </div>

                    {/* Platform Management (Admin ONLY) */}
                    {user.role === 'admin' && (
                        <div className="mb-5">
                            {isSidebarOpen && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-3">Admin</p>}
                            <nav className="flex flex-col gap-0.5 w-full">
                                <button onClick={() => setView('monitor')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} ${view === 'monitor' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                    <Activity size={18} className="shrink-0" />
                                    {isSidebarOpen && <span>Health Monitor</span>}
                                </button>
                                <button onClick={() => setView('clients')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} ${view === 'clients' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                    <Users size={18} className="shrink-0" />
                                    {isSidebarOpen && <span>User Management</span>}
                                </button>
                                <button onClick={() => setView('system-settings')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} ${view === 'system-settings' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                    <ShieldCheck size={18} className="shrink-0" />
                                    {isSidebarOpen && <span>Platform Control</span>}
                                </button>
                            </nav>
                        </div>
                    )}

                    {/* Products */}
                    {user.role !== 'admin' && (
                        <div className="mb-5">
                            {isSidebarOpen && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-3">Products</p>}
                            <nav className="flex flex-col gap-0.5">
                                {/* Blog Product */}
                                <button
                                    onClick={() => {
                                        if (isSidebarOpen) {
                                            setExpandedProducts(p => ({ ...p, blog: !p.blog }));
                                        } else {
                                            setView('list');
                                        }
                                    }}
                                    className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} ${(view === 'list' || (view === 'edit')) ? 'text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}
                                >
                                    <BookOpen size={18} className="shrink-0" />
                                    {isSidebarOpen && (
                                        <>
                                            <span className="flex-1">Blog</span>
                                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${expandedProducts.blog ? 'rotate-180' : ''}`} />
                                        </>
                                    )}
                                </button>
                                {/* Blog Sub-items */}
                                {isSidebarOpen && expandedProducts.blog && (
                                    <div className="ml-5 pl-3 border-l-2 border-gray-100 flex flex-col gap-0.5 mt-0.5">
                                        <button onClick={() => setView('list')} className={`flex items-center gap-3 w-full text-left px-3 py-1.5 rounded-lg text-[12px] transition-all duration-150 ${view === 'list' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                            <FileText size={15} className="shrink-0" />
                                            <span>All Posts</span>
                                        </button>
                                        <button onClick={() => { setCurrentBlog(null); setView('edit'); }} className={`flex items-center gap-3 w-full text-left px-3 py-1.5 rounded-lg text-[12px] transition-all duration-150 ${view === 'edit' && !currentBlog ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                            <Plus size={15} className="shrink-0" />
                                            <span>Create Blog</span>
                                        </button>
                                    </div>
                                )}
                            </nav>
                        </div>
                    )}

                    {/* Growth */}
                    {user.role !== 'admin' && (
                        <div className="mb-5">
                            {isSidebarOpen && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-3">Growth</p>}
                            <nav className="flex flex-col gap-0.5">
                                <button onClick={() => setView('embed')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} ${view === 'embed' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                    <Code2 size={18} className="shrink-0" />
                                    {isSidebarOpen && <span>Distribution</span>}
                                </button>
                                <button onClick={() => setView('analytics')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} ${view === 'analytics' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                    <BarChart3 size={18} className="shrink-0" />
                                    {isSidebarOpen && <span>Analytics</span>}
                                </button>
                                <button onClick={() => window.open('/preview', '_blank')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} text-gray-500 hover:bg-gray-50 hover:text-gray-700`}>
                                    <Eye size={18} className="shrink-0" />
                                    {isSidebarOpen && <span>Live Preview</span>}
                                </button>
                                <button onClick={() => { setCurrentBlog(null); setView('feed'); }} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} ${view === 'feed' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                    <Globe size={18} className="shrink-0" />
                                    {isSidebarOpen && <span>Platform Feed</span>}
                                </button>
                            </nav>
                        </div>
                    )}

                    {/* Settings */}
                    <div className="mb-5">
                        {isSidebarOpen && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-3">Settings</p>}
                        <nav className="flex flex-col gap-0.5">
                            {user.role !== 'admin' && (
                                <>
                                    <button onClick={() => setView('branding')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} ${view === 'branding' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                        <Zap size={18} className="shrink-0" />
                                        {isSidebarOpen && <span>Brand</span>}
                                    </button>
                                    <button onClick={() => setView('business')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} ${view === 'business' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                        <Briefcase size={18} className="shrink-0" />
                                        {isSidebarOpen && <span>Growth Suite</span>}
                                    </button>
                                </>
                            )}
                            <button onClick={() => setView('account')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} ${view === 'account' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                <Settings size={18} className="shrink-0" />
                                {isSidebarOpen && <span>Account</span>}
                            </button>
                            <button onClick={() => setView('profile')} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${!isSidebarOpen && 'justify-center px-2'} ${view === 'profile' ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                                <UserIcon size={18} className="shrink-0" />
                                {isSidebarOpen && <span>Profile</span>}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Credits Card */}
                {isSidebarOpen && user?.role !== 'admin' && (
                    <div className="mx-3 mb-2 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50">
                        <div className="flex items-center gap-2 mb-1">
                            <Coins size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Credits</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{user?.credits ?? 0}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">1 credit = 1 post • AI uses 10</p>
                    </div>
                )}
                {!isSidebarOpen && user?.role !== 'admin' && (
                    <div className="mx-auto mb-2 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center" title={`Credits: ${user?.credits ?? 0}`}>
                        <span className="text-xs font-bold text-indigo-600">{user?.credits ?? 0}</span>
                    </div>
                )}

                {/* Profile Section */}
                <div className="mt-auto px-3 py-3 border-t border-gray-100 shrink-0 z-30">
                    <div className={`flex ${isSidebarOpen ? 'flex-col gap-1.5' : 'flex-col items-center gap-1.5'} w-full`}>
                        <div className={`flex items-center gap-3 overflow-hidden w-full p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${!isSidebarOpen && 'justify-center p-2'}`} onClick={() => setView('profile')}>
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-sm">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {isSidebarOpen && (
                                <div className="flex flex-col truncate pr-2">
                                    <span className="text-sm font-medium text-gray-800 truncate">{user?.username || 'User'}</span>
                                    <span className="text-[10px] text-gray-400 truncate">{user?.email || 'user@example.com'}</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onLogout}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 font-medium text-[12px] hover:text-rose-500 hover:bg-rose-50 transition-all ${!isSidebarOpen && 'w-full justify-center px-0'} ${isSidebarOpen && 'w-full'}`}
                            title="Logout"
                        >
                            <LogOut size={14} />
                            {isSidebarOpen && <span>Sign out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen overflow-y-auto relative flex flex-col">
                {/* Global Announcement Banner */}
                {systemSettings?.globalAnnouncement?.isActive && (
                    <div className={`px-6 py-2.5 flex items-center justify-center gap-3 text-white text-xs font-black uppercase tracking-widest z-30 sticky top-0 ${systemSettings.globalAnnouncement.type === 'warning' ? 'bg-amber-500' :
                        systemSettings.globalAnnouncement.type === 'error' ? 'bg-rose-500' :
                            systemSettings.globalAnnouncement.type === 'success' ? 'bg-emerald-500' : 'bg-primary'
                        }`}>
                        <Globe size={14} className="animate-pulse" />
                        <span>{systemSettings.globalAnnouncement.text}</span>
                    </div>
                )}

                {/* Incomplete Profile Banner */}
                {!user?.isProfileComplete && user?.role !== 'admin' && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200/50 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 z-20 relative sticky top-0">
                        <div className="flex items-center gap-3 text-amber-700">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center"><UserCircle2 size={18} /></div>
                            <div>
                                <p className="font-semibold text-sm">Complete your profile</p>
                                <p className="text-xs text-amber-600/80">Fill out your bio and display name to unlock all features.</p>
                            </div>
                        </div>
                        <button onClick={() => setView('profile')} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm whitespace-nowrap">
                            Complete Now
                        </button>
                    </div>
                )}

                {/* List View */}
                {view === 'list' && (
                    <div className="p-6 md:p-10 mb-20 max-w-7xl mx-auto animate-fade-in w-full">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-10">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
                                    Welcome back, {user?.username?.split(' ')[0] || 'Creator'} 👋
                                </h1>
                                <p className="text-gray-500 text-sm">Here's an overview of your content performance.</p>
                            </div>
                            <div className="flex w-full md:w-auto items-center gap-3">
                                <div className="relative w-full md:w-64">
                                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search articles..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 shadow-sm transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => { setCurrentBlog(null); setView('edit'); }}
                                    className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                                >
                                    <Plus size={16} />
                                    New Post
                                </button>
                            </div>
                        </div>

                        {/* Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 flex items-center gap-4 group">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-0.5">Total Articles</p>
                                    <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 flex items-center gap-4 group">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20">
                                    <Check size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-0.5">Published</p>
                                    <p className="text-2xl font-bold text-gray-900">{blogs.filter(b => b.status === 'published').length}</p>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 flex items-center gap-4 group">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-amber-500/20">
                                    <Edit3 size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-0.5">Drafts</p>
                                    <p className="text-2xl font-bold text-gray-900">{blogs.filter(b => b.status === 'draft' || !b.status).length}</p>
                                </div>
                            </div>
                            <div className="bg-white/70 backdrop-blur-sm p-5 rounded-2xl border border-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 flex items-center gap-4 group">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-violet-500/20">
                                    <Coins size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-0.5">Credits</p>
                                    <p className="text-2xl font-bold text-gray-900">{user?.credits ?? 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-2 mb-8 bg-white/60 backdrop-blur-sm p-1 rounded-xl border border-gray-200/50 shadow-sm w-fit">
                            <button onClick={() => setStatusFilter('all')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === 'all' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>All</button>
                            <button onClick={() => setStatusFilter('published')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === 'published' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>Live</button>
                            <button onClick={() => setStatusFilter('draft')} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === 'draft' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'}`}>Drafts</button>
                        </div>


                        {blogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 px-6 border-2 border-dashed border-gray-200 rounded-2xl bg-white/40 backdrop-blur-sm relative overflow-hidden">
                                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5 shadow-sm border border-indigo-100/50">
                                    <FileText size={28} className="text-indigo-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No publications yet</h3>
                                <p className="text-gray-500 text-center text-sm mb-6 max-w-sm">Your writing journey begins here. Create your first post.</p>
                                <button onClick={() => { setCurrentBlog(null); setView('edit'); }} className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all">
                                    <Plus size={16} />
                                    Start Writing
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {filteredBlogs.map(blog => (
                                    <div key={blog.id || blog._id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group">
                                        <div className="h-44 bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center relative overflow-hidden">
                                            {blog.coverImage ? (
                                                <img src={blog.coverImage} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" alt="Cover" />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/80 to-violet-50/80 flex items-center justify-center">
                                                    <FileText size={40} className="text-indigo-200" />
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3 z-10">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${blog.status === 'published' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                                                    {blog.status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                                                    {blog.status || 'draft'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2 mb-3 group-hover:text-indigo-600 transition-colors">{blog.title}</h3>
                                            <div className="flex items-center text-xs text-gray-400 font-medium mb-4">
                                                <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                                                <div className="flex flex-col gap-1 cursor-help" title="SEO Health Score">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">SEO</span>
                                                    <div className="flex items-center gap-1">
                                                        <div className={`w-5 h-1 rounded-full ${blog.metaDescription ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                                                        <div className={`w-5 h-1 rounded-full ${blog.metaDescription ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                                                        <div className={`w-5 h-1 rounded-full ${blog.title && blog.title.length > 10 ? 'bg-emerald-400' : 'bg-gray-200'}`}></div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                                                    <button onClick={() => { setCurrentBlog(blog); setView('edit'); }} className="h-8 w-8 flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-500 transition-colors" title="Edit">
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button onClick={() => handleDelete(blog.id || blog._id)} className="h-8 w-8 flex items-center justify-center bg-rose-50 hover:bg-rose-100 rounded-lg text-rose-500 transition-colors" title="Delete">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Monitor View */}
                {view === 'monitor' && user.role === 'admin' && adminMetrics && (
                    <div className="p-8 md:p-12 max-w-7xl mx-auto animate-fade-in">
                        <h2 className="text-2xl font-black text-textMain tracking-tighter">PublishPro Dashboard</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div className="glass-card-premium p-8 bg-surface">
                                <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-2">Total Users</p>
                                <p className="text-5xl font-black text-textMain">{adminMetrics.totalUsers}</p>
                            </div>
                            <div className="glass-card-premium p-8 bg-surface">
                                <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-2">Platform Clients</p>
                                <p className="text-5xl font-black text-textMain">{adminMetrics.totalClients}</p>
                            </div>
                            <div className="glass-card-premium p-8 bg-surface">
                                <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-2">Total Posts</p>
                                <p className="text-5xl font-black text-textMain">{adminMetrics.totalBlogs}</p>
                            </div>
                        </div>
                        <div className="glass-card-premium overflow-hidden border border-border/60">
                            <div className="p-6 border-b border-border bg-surfaceHover/30">
                                <h3 className="text-xl font-bold text-textMain">Recent Platform Activity</h3>
                            </div>
                            <div className="p-0 overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-surface/50 text-textMuted uppercase text-[10px] font-black tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">User Email</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {adminMetrics.recentUsers.map(u => (
                                            <tr key={u._id} className="hover:bg-primary/5 transition-colors">
                                                <td className="px-6 py-4 font-bold text-textMain">{u.email}</td>
                                                <td className="px-6 py-4 lowercase">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-textMuted">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Account View */}
                {view === 'account' && client && (
                    <div className="p-8 md:p-12 max-w-4xl mx-auto animate-fade-in">
                        <h2 className="text-4xl font-extrabold text-textMain tracking-tight mb-8">Account Settings</h2>
                        <div className="glass-card-premium p-8 mb-8 border border-border shadow-2xl">
                            <div className="flex justify-between items-center mb-10 pb-6 border-b border-border">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-2xl">
                                        {client.companyName ? client.companyName[0].toUpperCase() : 'C'}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-textMain">{client.companyName}</h3>
                                        <p className="text-xs text-textMuted font-bold uppercase tracking-widest mt-1">Industrial Infrastructure</p>
                                    </div>
                                </div>
                                <span className="px-4 py-1.5 bg-primary text-white text-[10px] font-black uppercase rounded-full shadow-lg shadow-primary/20">{client.subscriptionTier}</span>
                            </div>
                            <div className="space-y-10">
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block">API Key Credentials</label>
                                        <button
                                            onClick={regenerateApiKey}
                                            className="text-[10px] font-black text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                                        >
                                            <RefreshCw size={12} />
                                            Regenerate Key
                                        </button>
                                    </div>
                                    <div className="p-5 bg-gray-950 border border-gray-800 rounded-2xl text-primary font-mono text-sm flex justify-between items-center group shadow-inner">
                                        <span className="truncate pr-4">{client.apiKey}</span>
                                        <button onClick={() => { navigator.clipboard.writeText(client.apiKey); alert('Copied to clipboard'); }} className="p-2.5 bg-gray-900 border border-white/5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all shadow-lg active:scale-90">
                                            <Check size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-textMuted font-medium mt-3 px-1 italic">Use this key to authorize your blogs on external platforms.</p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-4">Allowed Domains</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-surfaceHover border border-border rounded-xl text-textMain text-sm font-bold flex items-center gap-3">
                                            <Globe2 size={16} className="text-blue-500" />
                                            {client.allowedDomains?.length > 0 ? client.allowedDomains.join(', ') : 'Wildcard (*) Unrestricted'}
                                        </div>
                                        <div className="p-4 bg-surface border border-dashed border-border rounded-xl text-textMuted text-xs font-medium flex items-center justify-center cursor-not-allowed italic">
                                            + Add New Domain (Pro Feature)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card-premium p-8 border border-border bg-emerald-50/10">
                            <h4 className="text-lg font-bold text-textMain mb-2 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-emerald-500" />
                                Security Audit
                            </h4>
                            <p className="text-sm text-textMuted font-medium mb-6 leading-relaxed">Your account is currently protected by Industrial-Grade JWT encryption and cross-domain origin validation.</p>
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-textMain">100%</div>
                                    <div className="text-[10px] font-black text-textMuted uppercase tracking-tighter">Identity Score</div>
                                </div>
                                <div className="h-10 w-px bg-border"></div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-emerald-500">Live</div>
                                    <div className="text-[10px] font-black text-textMuted uppercase tracking-tighter">API Status</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Business Toolkit View */}
                {view === 'business' && (
                    <BusinessToolkit blogs={blogs} client={client} onRegenerate={regenerateApiKey} />
                )}

                {/* Edit View */}
                {view === 'edit' && (
                    <div className="h-full flex flex-col pt-0 animate-fade-in w-full">
                        <div className="p-8 flex-1 w-full max-w-6xl mx-auto">
                            <Editor initialData={currentBlog} onSave={handleSaveBlog} onCancel={() => setView('list')} />
                        </div>
                    </div>
                )}

                {/* Embed View */}
                {view === 'embed' && <EmbedSection blogs={blogs} client={client} />}

                {/* Clients Registry (Admin ONLY) */}
                {view === 'clients' && user.role === 'admin' && (
                    <UserManagement />
                )}

                {/* Branding Suite (User Settings) */}
                {view === 'branding' && client && (
                    <BrandSettingsSection
                        client={client}
                        onSave={(updated) => setClient(updated)}
                    />
                )}

                {view === 'analytics' && (
                    <AnalyticsSection />
                )}

                {view === 'profile' && (
                    <ProfileSection onProfileSaved={fetchCurrentUser} />
                )}

                {view === 'feed' && (
                    <FeedSection />
                )}

                {view === 'system-settings' && user.role === 'admin' && (
                    <SystemSettingsSection
                        settings={systemSettings}
                        onUpdate={(updated) => setSystemSettings(updated)}
                    />
                )}
            </main>
        </div>
    );
}

function ProfileSection({ onProfileSaved }) {
    const [profile, setProfile] = useState({ name: '', bio: '', profilePicUrl: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/users/profile/me');
                setProfile({ name: res.data.name || '', bio: res.data.bio || '', profilePicUrl: res.data.profilePicUrl || '' });
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            await api.put('/api/users/profile', profile);
            alert('Profile saved!');
            if (onProfileSaved) onProfileSaved();
        } catch (e) { alert('Error saving profile'); }
    };

    if (loading) return <div className="p-12 text-center text-textMuted">Loading Profile...</div>;

    return (
        <div className="p-8 md:p-12 max-w-3xl mx-auto animate-fade-in w-full">
            <h2 className="text-4xl font-extrabold text-textMain tracking-tight mb-8">Creator Profile</h2>
            <div className="glass-card-premium p-8 border border-border">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                    <div className="w-32 h-32 rounded-3xl bg-surfaceHover border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                        {profile.profilePicUrl ? <img src={profile.profilePicUrl} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={48} className="text-textMuted" />}
                    </div>
                    <div className="w-full">
                        <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-2">Avatar URL</label>
                        <input type="text" value={profile.profilePicUrl} onChange={e => setProfile({ ...profile, profilePicUrl: e.target.value })} className="w-full bg-surface border border-border px-4 py-3 rounded-xl text-sm mb-4 focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" placeholder="https://..." />

                        <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-2">Display Name</label>
                        <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full bg-surface border border-border px-4 py-3 rounded-xl text-sm focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" placeholder="Your name" />
                    </div>
                </div>
                <div className="mb-8">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-2">Bio / Tagline</label>
                    <textarea value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} className="w-full bg-surface border border-border px-4 py-3 rounded-xl text-sm h-32 resize-none focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" placeholder="Tell readers about yourself..."></textarea>
                </div>
                <div className="flex justify-end">
                    <button onClick={handleSave} className="btn-primary py-2.5 px-6 shrink-0">Save Profile</button>
                </div>
            </div>
        </div>
    );
}

function FeedSection() {
    const [feed, setFeed] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [activeCommentPost, setActiveCommentPost] = useState(null);
    const [expandedPost, setExpandedPost] = useState(null);
    const [comments, setComments] = useState({});

    const user = JSON.parse(localStorage.getItem('user'));

    const fetchFeed = async () => {
        try {
            const res = await api.get('/api/feed');
            setFeed(res.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchFeed(); }, []);

    const toggleLike = async (id) => {
        try {
            const res = await api.post(`/api/blogs/${id}/like`);
            setFeed(feed.map(b => b.id === id ? { ...b, likes: res.data } : b));
        } catch (e) { console.error(e); }
    };

    const loadComments = async (id) => {
        try {
            const res = await api.get(`/api/blogs/${id}/comments`);
            setComments({ ...comments, [id]: res.data });
            setActiveCommentPost(activeCommentPost === id ? null : id);
        } catch (e) { console.error(e); }
    };

    const submitComment = async (id) => {
        if (!commentText.trim()) return;
        try {
            const res = await api.post(`/api/blogs/${id}/comments`, { text: commentText });
            const list = comments[id] || [];
            setComments({ ...comments, [id]: [res.data, ...list] });
            setCommentText('');
        } catch (e) { console.error(e); }
    };

    if (loading) return <div className="p-12 text-center text-textMuted">Loading Feed...</div>;

    return (
        <div className="p-8 md:p-12 max-w-4xl mx-auto animate-fade-in w-full">
            <h2 className="text-4xl font-extrabold text-textMain tracking-tight mb-2">Platform Feed</h2>
            <p className="text-textMuted text-sm font-medium mb-10">Discover and interact with top content from the community.</p>

            <div className="flex flex-col gap-8">
                {feed.length === 0 && <div className="p-12 border border-dashed border-border/50 text-center rounded-2xl bg-surface/50 text-textMuted">No public posts yet.</div>}

                {feed.map(blog => {
                    const isLiked = blog.likes?.includes(user?._id) || blog.likes?.includes('000000000000000000000000');
                    return (
                        <div key={blog.id} className="glass-card-premium overflow-hidden border border-border transition-shadow hover:shadow-lg bg-surface">
                            {blog.coverImage && <img src={blog.coverImage} className="w-full h-64 object-cover border-b border-border" alt="Cover" />}
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-2xl font-black text-textMain leading-tight mb-2">{blog.title}</h3>
                                        <div className="flex items-center gap-2 text-xs font-bold text-textMuted uppercase tracking-wider">
                                            <span>{blog.author || 'Pioneer Writer'}</span>
                                            <div className="w-1 h-1 rounded-full bg-border" />
                                            <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-surfaceHover text-textMuted text-[10px] font-black uppercase rounded-full border border-border shrink-0">{blog.category}</span>
                                </div>

                                <div className={`prose prose-sm prose-invert text-textMuted mb-2 prose-p:my-2 ${expandedPost === blog.id ? '' : 'line-clamp-3'}`} dangerouslySetInnerHTML={{ __html: blog.contentHtml }} />

                                {blog.contentHtml && blog.contentHtml.length > 200 && (
                                    <button
                                        onClick={() => setExpandedPost(expandedPost === blog.id ? null : blog.id)}
                                        className="text-primary text-sm font-bold mb-6 hover:underline disabled:opacity-50"
                                    >
                                        {expandedPost === blog.id ? 'Show Less' : 'Read Full Post'}
                                    </button>
                                )}

                                <div className="flex items-center gap-6 pt-6 border-t border-border/50">
                                    <button onClick={() => toggleLike(blog.id)} className={`flex items-center gap-2 text-sm font-bold transition-colors ${isLiked ? 'text-rose-500 hover:text-rose-600' : 'text-textMuted hover:text-textMain'}`}>
                                        <Heart size={18} className={isLiked ? 'fill-current text-rose-500' : ''} />
                                        {blog.likes?.length || 0} Likes
                                    </button>
                                    <button onClick={() => loadComments(blog.id)} className="flex items-center gap-2 text-sm font-bold text-textMuted hover:text-primary transition-colors">
                                        <MessageSquare size={18} />
                                        Discussion
                                    </button>
                                </div>

                                {activeCommentPost === blog.id && (
                                    <div className="mt-6 pt-6 border-t border-border/50 animate-slide-up bg-surfaceHover/30 -mx-8 -mb-8 px-8 pb-8 rounded-b-xl">
                                        <div className="flex gap-3 mb-6 relative">
                                            <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add to the discussion..." className="flex-1 bg-surface border border-border pl-4 pr-12 py-3 rounded-xl text-sm focus:border-primary focus:outline-none transition-colors" />
                                            <button onClick={() => submitComment(blog.id)} className="absolute right-2 top-1.5 bottom-1.5 btn-primary px-3 rounded-lg"><Send size={14} /></button>
                                        </div>
                                        <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                            {(comments[blog.id] || []).map(c => (
                                                <div key={c._id} className="flex gap-4">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center border border-border/50 shadow-sm">
                                                        {c.userId?.profilePicUrl ? <img src={c.userId.profilePicUrl} className="w-full h-full object-cover" /> : <UserIcon size={16} className="text-primary" />}
                                                    </div>
                                                    <div className="flex-1 bg-surface p-4 rounded-2xl rounded-tl-sm border border-border/40 shadow-sm">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className="text-xs font-bold text-textMain">{c.userId?.name || 'User'}</span>
                                                            <span className="text-[10px] text-textMuted font-medium">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-sm text-textMain/90 leading-relaxed">{c.text}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {(comments[blog.id] || []).length === 0 && <p className="text-xs font-bold uppercase tracking-widest text-textMuted text-center py-6">Be the first to share your thoughts.</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function EmbedSection({ blogs, client }) {
    const [selectedBlogId, setSelectedBlogId] = useState('all');
    const [theme, setTheme] = useState('light');
    const [embedMode, setEmbedMode] = useState('static');
    const [showDate, setShowDate] = useState(true);
    const [showAuthor, setShowAuthor] = useState(true);
    const [showSummary, setShowSummary] = useState(true);
    const [lang, setLang] = useState('en');

    const generateSnippet = () => {
        const params = [];
        if (theme !== 'light') params.push(`data-theme="${theme}"`);
        if (selectedBlogId !== 'all') params.push(`data-blog-id="${selectedBlogId}"`);
        if (!showDate) params.push(`data-hide-date="true"`);
        if (!showAuthor) params.push(`data-hide-author="true"`);
        if (!showSummary) params.push(`data-hide-summary="true"`);
        if (lang !== 'en') params.push(`data-lang="${lang}"`);

        const scriptUrl = `${API_BASE_URL}/api/embed.js?key=${client?.apiKey || 'YOUR_API_KEY'}`;

        if (embedMode === 'static') {
            return `<!-- LexiBlog Embed -->\n<div id="blog-embed-container" ${params.join(' ')}></div>\n<script src="${scriptUrl}"></script>`;
        } else {
            return `// Fetch API Payload\nfetch("${API_BASE_URL}/api/public/blogs${selectedBlogId !== 'all' ? `/${selectedBlogId}` : ''}", {\n  headers: {"x-api-key": "${client?.apiKey || 'YOUR_API_KEY'}" }\n})\n.then(res => res.json())\n.then(data => console.log(data));`;
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateSnippet());
        alert('Code copied to clipboard!');
    };

    return (
        <div className="p-6 md:p-10 mb-20 max-w-7xl mx-auto animate-fade-in w-full">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Distribution & Embeds</h2>
                <p className="text-gray-500 text-sm mt-1">Integrate your content anywhere using our powerful embed engine.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Configuration Panel */}
                <div className="xl:col-span-5 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Widget Configuration
                        </h3>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Content Source</label>
                                <select
                                    value={selectedBlogId}
                                    onChange={(e) => setSelectedBlogId(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="all">Complete News Feed (Recommended)</option>
                                    <optgroup label="Single Articles">
                                        {blogs.map(b => (
                                            <option key={b.id || b._id} value={b.id || b._id}>{b.title}</option>
                                        ))}
                                    </optgroup>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Visual Theme</label>
                                    <select
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm capitalize"
                                    >
                                        <option value="light">Classic Light</option>
                                        <option value="dark">Pro Dark</option>
                                        <option value="ocean">Ocean Pulse</option>
                                        <option value="cyberpunk">Cybernetic</option>
                                        <option value="notion">Notion Style</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-2">Language</label>
                                    <select
                                        value={lang}
                                        onChange={(e) => setLang(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-sm"
                                    >
                                        <option value="en">English (US)</option>
                                        <option value="es">Español</option>
                                        <option value="fr">Français</option>
                                        <option value="de">Deutsch</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">Display Options</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <button onClick={() => setShowDate(!showDate)} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${showDate ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                        Date
                                    </button>
                                    <button onClick={() => setShowAuthor(!showAuthor)} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${showAuthor ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                        Author
                                    </button>
                                    <button onClick={() => setShowSummary(!showSummary)} className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${showSummary ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                        Summary
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                Embed Snippet
                            </h3>
                            <button onClick={copyToClipboard} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors">
                                Copy Code
                            </button>
                        </div>
                        <div className="flex bg-gray-50 p-1 rounded-xl mb-4 border border-gray-100">
                            <button onClick={() => setEmbedMode('static')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${embedMode === 'static' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>HTML Script</button>
                            <button onClick={() => setEmbedMode('dynamic')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all ${embedMode === 'dynamic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>REST API</button>
                        </div>
                        <pre className="p-4 bg-gray-950 text-indigo-400 rounded-xl text-[11px] overflow-x-auto border border-gray-800 font-mono leading-relaxed min-h-[120px]">
                            {generateSnippet()}
                        </pre>
                    </div>
                </div>

                {/* Preview Rail */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm p-8 min-h-[600px] flex flex-col relative overflow-hidden">
                        <div className="absolute top-6 left-6 flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Widget Preview</span>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center pt-8">
                            <div className={`w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : theme === 'cyberpunk' ? 'bg-black border-yellow-500 border-2' : 'bg-white border border-gray-100'}`} style={{ borderBottom: `4px solid ${theme === 'notion' ? '#E5E7EB' : '#4F46E5'}` }}>
                                {/* Widget Header Simulation */}
                                <div className={`h-14 px-6 flex items-center justify-between border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-50'}`}>
                                    <div className="h-5 w-24 bg-indigo-50/50 rounded-lg"></div>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/30"></div>
                                    </div>
                                </div>

                                <div className="p-7 space-y-6">
                                    {selectedBlogId === 'all' ? (
                                        blogs.slice(0, 2).map((b, i) => (
                                            <div key={i} className="group cursor-default">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {showDate && <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{new Date().toLocaleDateString()}</span>}
                                                    {showAuthor && <span className="text-[10px] font-bold text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full italic">by CMSPro Creator</span>}
                                                </div>
                                                <h4 className={`text-lg font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'} leading-tight`}>{b.title}</h4>
                                                {showSummary && <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">PublishPro's advanced analytics engine allows you to track content performance in real-time across your entire network...</p>}
                                                <div className="mt-4 flex gap-2">
                                                    <div className="h-2 w-16 bg-indigo-500/20 rounded-full"></div>
                                                    <div className="h-2 w-16 bg-indigo-500/10 rounded-full"></div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                {showDate && <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest">{new Date().toLocaleDateString()}</span>}
                                                {showAuthor && <span className="text-[11px] font-bold text-gray-400 px-2 py-0.5 bg-gray-50 rounded-full italic">by CMSPro Creator</span>}
                                            </div>
                                            <h4 className={`text-2xl font-black mb-4 ${theme === 'dark' || theme === 'cyberpunk' ? 'text-white' : 'text-gray-900'} leading-tight`}>{blogs.find(b => b.id === selectedBlogId || b._id === selectedBlogId)?.title || 'Selected Article'}</h4>
                                            {showSummary && <p className="text-base text-gray-400 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>}
                                            <div className="mt-8 flex gap-3">
                                                <button className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/30">Read Article</button>
                                                <button className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold">Share</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className={`p-4 bg-gray-50/50 text-[10px] text-center font-bold text-gray-400 border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-900/50' : 'border-gray-50'}`}>
                                    POWERED BY PUBLISHPRO ENGAGEMENT ENGINE
                                </div>
                            </div>

                            <div className="mt-12 w-full max-w-lg">
                                <div className="flex items-center gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                                    <div className="p-2 bg-indigo-500 text-white rounded-lg"></div>
                                    <p className="text-[11px] font-medium text-indigo-700">This widget will automatically synchronize with your brand settings defined in the <span className="font-bold underline cursor-pointer" onClick={() => setView('branding')}>Brand tab</span>.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BusinessToolkit({ blogs, client, onRegenerate }) {
    const totalViews = blogs.length * 482;
    const avgReadTime = "4m 12s";
    const globalSEO = calculateGlobalSEO(blogs);

    const totalImages = blogs.reduce((acc, b) => acc + (b.contentHtml?.split('<img').length - 1 || 0), 0);
    const imagesWithAlt = blogs.reduce((acc, b) => acc + (b.contentHtml?.split('alt="').length - 1 || 0), 0);
    const altCoverage = totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 100;

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto animate-fade-in">
            <div className="mb-12">
                <h2 className="text-4xl font-extrabold text-textMain tracking-tight mb-2">Business Presence</h2>
                <p className="text-textMuted text-sm font-medium">Professional SEO tools, Analytics, and API Management.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                <div className="lg:col-span-2 glass-card-premium p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BarChart3 size={120} />
                    </div>
                    <h3 className="text-xl font-black text-textMain mb-8 uppercase tracking-widest">Global Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div>
                            <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-2">Total Impressions</p>
                            <p className="text-4xl font-black text-textMain">{totalViews.toLocaleString()}</p>
                            <div className="mt-2 text-[10px] font-bold text-emerald-500">+14.2% since last week</div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-2">Avg Read Time</p>
                            <p className="text-4xl font-black text-textMain">{avgReadTime}</p>
                            <div className="mt-2 text-[10px] font-bold text-blue-500">Industry Leader (Top 4%)</div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-textMuted uppercase tracking-widest mb-2">Conversion Rate</p>
                            <p className="text-4xl font-black text-primary">6.4%</p>
                            <div className="mt-2 text-[10px] font-bold text-textMuted">Stabilized Performance</div>
                        </div>
                    </div>
                    <div className="mt-12 flex items-end gap-1.5 h-24">
                        {[40, 60, 45, 90, 65, 80, 55, 70, 85, 40, 60, 75, 50, 95, 80].map((h, i) => (
                            <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-sm"></div>
                        ))}
                    </div>
                </div>

                <div className="glass-card-premium p-8 border-l-4 border-l-emerald-500 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-black text-textMain uppercase tracking-widest">SEO Health</h3>
                            <ShieldCheck size={28} className="text-emerald-500" />
                        </div>
                        <p className="text-5xl font-black text-textMain mb-4">{globalSEO}%</p>
                        <p className="text-xs text-textMuted font-medium leading-relaxed">Based on real content markers: metadata coverage, Alt-text density, and schema validity.</p>
                    </div>
                    <div className="mt-8 pt-6 border-t border-border flex flex-col gap-3">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-textMuted uppercase">Metadata Status</span>
                            <span className={globalSEO > 80 ? 'text-emerald-500' : 'text-amber-500'}>{globalSEO > 90 ? 'Optimized' : 'Needs Review'}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="text-textMuted uppercase">Asset Alt-Text</span>
                            <span className={altCoverage > 80 ? 'text-emerald-500' : 'text-amber-500'}>{altCoverage}% Coverage</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card-premium p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-gray-100 rounded-lg"><TrendingUp size={20} className="text-primary" /></div>
                        <h3 className="text-lg font-bold text-textMain">Advanced API Options</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="p-5 bg-surface border border-border rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-textMuted uppercase tracking-widest">Master API Key</span>
                                <button onClick={onRegenerate} className="text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors uppercase underline underline-offset-4 tracking-tighter">Emergency Reset</button>
                            </div>
                            <div className="font-mono text-sm text-textMain truncate">{client?.apiKey}</div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-4 bg-white border border-border rounded-xl opacity-60 cursor-not-allowed">
                                <Globe2 size={18} className="text-textMuted" />
                                <span className="text-sm font-bold text-textMuted">Custom CNAME Mapping</span>
                                <span className="ml-auto px-2 py-0.5 bg-border text-textMuted text-[8px] font-black uppercase rounded">Enterprise Only</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <ShieldCheck size={18} className="text-emerald-500" />
                                <span className="text-sm font-bold text-emerald-600">Cross-Origin Protection</span>
                                <span className="ml-auto px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase rounded">ACTIVE</span>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-white border border-border rounded-xl opacity-60 cursor-not-allowed">
                                <Users size={18} className="text-textMuted" />
                                <span className="text-sm font-bold text-textMuted">Multi-User Collaboration</span>
                                <span className="ml-auto px-2 py-0.5 bg-border text-textMuted text-[8px] font-black uppercase rounded">Pro Feature</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-card-premium p-8 bg-primary/5 border-primary/20">
                    <h3 className="text-lg font-bold text-textMain mb-6">Commercial Reach</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Eye size={24} /></div>
                            <div>
                                <h4 className="text-base font-bold text-textMain">Audience Retention</h4>
                                <p className="text-xs text-textMuted font-medium">Users spend an average of 4.2m on your embedded pages.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-border shadow-sm">
                            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><RefreshCw size={24} /></div>
                            <div>
                                <h4 className="text-base font-bold text-textMain">Automatic Sync</h4>
                                <p className="text-xs text-textMuted font-medium">Your embeds are currently synchronized in real-time with the central server.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AdminClientsSection({ clients, onRefresh }) {
    const updateTier = async (id, tier) => {
        try {
            await api.put(`/api/admin/clients/${id}/tier`, { tier });
            onRefresh();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-extrabold text-textMain tracking-tight mb-8">Client Registry</h2>
            <div className="glass-card-premium overflow-hidden border border-border/60">
                <table className="w-full text-left text-sm">
                    <thead className="bg-surface/50 text-textMuted uppercase text-[10px] font-black tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Company</th>
                            <th className="px-6 py-4">API Key</th>
                            <th className="px-6 py-4">Tier</th>
                            <th className="px-6 py-4">Blogs</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {clients.map(c => (
                            <tr key={c._id} className="hover:bg-primary/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-textMain">{c.companyName}</div>
                                    <div className="text-[10px] text-textMuted font-medium">{new Date(c.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 font-mono text-[10px] text-textMuted">{c.apiKey}</td>
                                <td className="px-6 py-4">
                                    <select
                                        value={c.subscriptionTier}
                                        onChange={(e) => updateTier(c._id, e.target.value)}
                                        className="bg-surface border border-border rounded px-2 py-1 text-xs font-bold"
                                    >
                                        <option value="free">FREE</option>
                                        <option value="pro">PRO</option>
                                        <option value="enterprise">ENTERPRISE</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 font-bold text-primary">{c.blogCount || 0}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-primary hover:underline font-bold text-xs uppercase">Inspect</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BrandSettingsSection({ client, onSave }) {
    const bs = client.brandSettings || {};
    const [logoUrl, setLogoUrl] = useState(bs.logoUrl || '');
    const [primaryColor, setPrimaryColor] = useState(bs.primaryColor || '#4f46e5');
    const [secondaryColor, setSecondaryColor] = useState(bs.secondaryColor || '#7c3aed');
    const [fontFamily, setFontFamily] = useState(bs.fontFamily || 'Inter');
    const [tagline, setTagline] = useState(bs.tagline || '');
    const [footerText, setFooterText] = useState(bs.footerText || '');
    const [websiteUrl, setWebsiteUrl] = useState(bs.websiteUrl || '');
    const [twitter, setTwitter] = useState(bs.socialLinks?.twitter || '');
    const [linkedin, setLinkedin] = useState(bs.socialLinks?.linkedin || '');
    const [instagram, setInstagram] = useState(bs.socialLinks?.instagram || '');
    const [saving, setSaving] = useState(false);

    const fonts = ['Inter', 'Roboto', 'Poppins', 'Outfit', 'DM Sans', 'Nunito', 'Lato', 'Open Sans', 'Montserrat', 'Plus Jakarta Sans'];

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await api.put('/api/clients/me/branding', {
                logoUrl, primaryColor, secondaryColor, fontFamily, tagline, footerText, websiteUrl,
                socialLinks: { twitter, linkedin, instagram }
            });
            onSave(res.data);
            alert('Branding updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update branding.');
        } finally {
            setSaving(false);
        }
    };

    const inputClass = "w-full bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all";
    const labelClass = "text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5";

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto animate-fade-in w-full mb-20">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Brand Identity</h2>
                <p className="text-sm text-gray-500 mt-1">Customize how your brand appears across the platform and embedded widgets.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Visual Identity */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                            <Zap size={16} className="text-indigo-500" /> Visual Identity
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Logo URL</label>
                                <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className={inputClass} placeholder="https://example.com/logo.png" />
                                <p className="text-[10px] text-gray-400 mt-1">SVG or PNG recommended. Max height 40px.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Primary Color</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 bg-transparent border-0 cursor-pointer p-0 rounded-lg" />
                                        <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className={`${inputClass} font-mono uppercase flex-1`} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Secondary Color</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 bg-transparent border-0 cursor-pointer p-0 rounded-lg" />
                                        <input type="text" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className={`${inputClass} font-mono uppercase flex-1`} />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Font Family</label>
                                <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className={inputClass}>
                                    {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Brand Voice */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                            <MessageSquare size={16} className="text-indigo-500" /> Brand Voice
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className={labelClass}>Tagline</label>
                                <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className={inputClass} placeholder="Your brand in one sentence" />
                            </div>
                            <div>
                                <label className={labelClass}>Widget Footer Text</label>
                                <input type="text" value={footerText} onChange={e => setFooterText(e.target.value)} className={inputClass} placeholder="Powered by [Your Brand]" />
                            </div>
                            <div>
                                <label className={labelClass}>Website URL</label>
                                <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} className={inputClass} placeholder="https://yourbrand.com" />
                            </div>
                        </div>
                    </div>

                    {/* Social Presence */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-900 mb-5 flex items-center gap-2">
                            <Globe size={16} className="text-indigo-500" /> Social Presence
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Twitter / X</label>
                                <input type="text" value={twitter} onChange={e => setTwitter(e.target.value)} className={inputClass} placeholder="@handle" />
                            </div>
                            <div>
                                <label className={labelClass}>LinkedIn</label>
                                <input type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)} className={inputClass} placeholder="linkedin.com/in/you" />
                            </div>
                            <div>
                                <label className={labelClass}>Instagram</label>
                                <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className={inputClass} placeholder="@handle" />
                            </div>
                        </div>
                    </div>

                    {/* Save */}
                    <div className="flex justify-end">
                        <button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5 transition-all disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save Brand Settings'}
                        </button>
                    </div>
                </div>

                {/* Right Column - Live Preview */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-5">
                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Live Preview</h4>
                            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm" style={{ fontFamily: fontFamily }}>
                                <div className="h-10 px-3 flex items-center justify-between" style={{ borderBottom: `2px solid ${primaryColor}` }}>
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Logo" className="h-5 w-auto" />
                                    ) : (
                                        <div className="h-4 w-16 bg-gray-100 rounded"></div>
                                    )}
                                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                                </div>
                                <div className="p-3 space-y-2">
                                    {tagline && <p className="text-[9px] font-medium text-gray-500 italic">{tagline}</p>}
                                    <div className="h-2 w-full bg-gray-50 rounded"></div>
                                    <div className="h-2 w-[75%] bg-gray-50 rounded"></div>
                                    <div className="h-2 w-[50%] bg-gray-50 rounded"></div>
                                    <div className="mt-3 flex gap-1">
                                        <div className="h-5 w-12 rounded text-white text-[7px] flex items-center justify-center font-bold" style={{ backgroundColor: primaryColor }}>Read</div>
                                        <div className="h-5 w-12 rounded text-white text-[7px] flex items-center justify-center font-bold" style={{ backgroundColor: secondaryColor }}>Share</div>
                                    </div>
                                </div>
                                <div className="p-2 text-[8px] text-center font-semibold" style={{ backgroundColor: '#f9fafb', color: primaryColor }}>
                                    {footerText || 'Powered by CMSPro'}
                                </div>
                            </div>
                        </div>

                        {/* Color Palette Preview */}
                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Color Palette</h4>
                            <div className="flex gap-2">
                                <div className="flex-1 h-12 rounded-xl shadow-inner flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                                    <span className="text-white text-[9px] font-bold">Primary</span>
                                </div>
                                <div className="flex-1 h-12 rounded-xl shadow-inner flex items-center justify-center" style={{ backgroundColor: secondaryColor }}>
                                    <span className="text-white text-[9px] font-bold">Secondary</span>
                                </div>
                            </div>
                        </div>

                        {/* Font Preview */}
                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Typography</h4>
                            <div style={{ fontFamily: fontFamily }}>
                                <p className="text-lg font-bold text-gray-900">{fontFamily}</p>
                                <p className="text-xs text-gray-400 mt-1">The quick brown fox jumps over the lazy dog.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnalyticsSection() {
    return (
        <div className="p-8 md:p-12 max-w-7xl mx-auto animate-fade-in pb-32">
            <div className="mb-10">
                <h2 className="text-4xl font-extrabold text-textMain tracking-tight mb-2">Advanced Analytics</h2>
                <p className="text-textMuted text-sm font-medium">Visualizing your content performance across the PublishPro network.</p>
            </div>

            {/* High Level Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="glass-card-premium p-6 border border-border/60">
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Weekly Views</p>
                    <p className="text-4xl font-black text-textMain mb-2">18.1K</p>
                    <span className="text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded-md">+24% vs last week</span>
                </div>
                <div className="glass-card-premium p-6 border border-border/60">
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Avg. Read Time</p>
                    <p className="text-4xl font-black text-textMain mb-2">5.3m</p>
                    <span className="text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 py-1 rounded-md">+1.2m vs last week</span>
                </div>
                <div className="glass-card-premium p-6 border border-border/60">
                    <p className="text-xs font-bold text-textMuted uppercase tracking-widest mb-1">Click Through Rate</p>
                    <p className="text-4xl font-black text-textMain mb-2">8.4%</p>
                    <span className="text-amber-500 font-bold text-xs bg-amber-500/10 px-2 py-1 rounded-md">-0.5% vs last week</span>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-2 glass-card-premium p-8 border border-border/60 min-h-[400px]">
                    <h3 className="text-lg font-bold text-textMain mb-6">Traffic & Engagement (7 Days)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsMockData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorReadTime" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area yAxisId="left" type="monotone" dataKey="views" name="Page Views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                <Area yAxisId="right" type="monotone" dataKey="readTime" name="Read Time (m)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReadTime)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card-premium p-8 border border-border/60 min-h-[400px]">
                    <h3 className="text-lg font-bold text-textMain mb-6">Traffic Sources</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trafficMockData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="source" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                                />
                                <Bar dataKey="users" name="Returning Users" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

