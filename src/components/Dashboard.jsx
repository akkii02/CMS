import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus, Edit3, Trash2, LayoutDashboard, Code2,
    ChevronRight, Check, FileText, ChevronLeft, LogOut,
    Eye, Activity, Users, Search, TrendingUp,
    Briefcase, ShieldCheck, BarChart3, Globe2, RefreshCw,
    Settings, Globe, Heart, Monitor, Zap, User as UserIcon, MessageSquare, ThumbsUp, Send, UserCircle2
} from 'lucide-react';
import Editor from './Editor';
import { calculateGlobalSEO, analyzeSEO } from '../utils/SEOAuditor';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

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

export default function Dashboard({ user, onLogout }) {
    const [blogs, setBlogs] = useState([]);
    const [client, setClient] = useState(null);
    const [allClients, setAllClients] = useState([]); // For Admin
    const [adminMetrics, setAdminMetrics] = useState(null);
    const [view, setView] = useState('list');
    const [currentBlog, setCurrentBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const filteredBlogs = blogs.filter(b => {
        const matchesSearch = b.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/blogs');
            setBlogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientData = async () => {
        try {
            const res = await axios.get('/api/clients/me');
            setClient(res.data);
        } catch (err) {
            console.error('Failed to fetch client profile', err);
        }
    };

    const fetchAdminMetrics = async () => {
        if (user.role !== 'admin') return;
        try {
            const res = await axios.get('/api/admin/metrics');
            setAdminMetrics(res.data);
        } catch (err) {
            console.error('Failed to fetch admin metrics', err);
        }
    };

    const fetchAllClients = async () => {
        if (user.role !== 'admin') return;
        try {
            const res = await axios.get('/api/admin/clients');
            setAllClients(res.data);
        } catch (err) {
            console.error('Failed to fetch clients', err);
        }
    };

    useEffect(() => {
        fetchBlogs();
        fetchClientData();
        if (user.role === 'admin') {
            fetchAdminMetrics();
            fetchAllClients();
        }
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;
        try {
            await axios.delete(`/api/blogs/${id}`);
            fetchBlogs();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveBlog = async (blogData) => {
        try {
            if (currentBlog?.id || currentBlog?._id) {
                const id = currentBlog.id || currentBlog._id;
                await axios.put(`/api/blogs/${id}`, blogData);
            } else {
                await axios.post('/api/blogs', blogData);
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
            const res = await axios.post('/api/clients/regenerate-key');
            setClient(res.data);
            alert('New API Key generated successfully!');
        } catch (err) {
            console.error('Failed to regenerate API key', err);
            alert('Failed to regenerate API key. Please try again.');
        }
    };

    return (
        <div className="w-full h-screen bg-background flex overflow-hidden relative selection:bg-primary/20">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="mesh-gradient absolute inset-0"></div>
            </div>

            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-gray-100 hidden md:flex flex-col z-20 shrink-0 transition-all duration-300 relative shadow-sm h-full`}>
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar pb-6 relative z-10">

                    {/* App Logo */}
                    <div className={`flex items-center gap-3 mb-12 mt-2 ${!isSidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primaryHover text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-primary/20">P</div>
                        {isSidebarOpen && <span className="text-2xl font-black tracking-tight text-gray-900">PublishPro</span>}
                    </div>

                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="absolute -right-4 top-10 bg-white border border-gray-200 rounded-full p-1.5 text-gray-400 hover:text-gray-900 hover:shadow-md transition-all z-50 shadow-sm flex items-center justify-center h-8 w-8 hover:scale-105"
                    >
                        {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {/* Platform Management (Admin ONLY) */}
                    {user.role === 'admin' && (
                        <div className="mb-10">
                            <h3 className={`text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ${isSidebarOpen ? 'ml-4' : 'text-center'}`}>
                                {isSidebarOpen ? 'Platform' : 'ADM'}
                            </h3>
                            <nav className="flex flex-col gap-1 w-full">
                                <button
                                    onClick={() => setView('monitor')}
                                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} ${view === 'monitor' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Activity size={20} className="shrink-0" />
                                    {isSidebarOpen && <span>Health Monitor</span>}
                                </button>
                                <button
                                    onClick={() => setView('clients')}
                                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} ${view === 'clients' ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <Users size={20} className="shrink-0" />
                                    {isSidebarOpen && <span>Client Registry</span>}
                                </button>
                            </nav>
                        </div>
                    )}

                    {/* Content Hub (Everyone) */}
                    <div className="mb-10">
                        <h3 className={`text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ${isSidebarOpen ? 'ml-4' : 'text-center'}`}>
                            {isSidebarOpen ? 'Content Hub' : 'HUB'}
                        </h3>
                        <nav className="flex flex-col gap-1">
                            <button
                                onClick={() => setView('list')}
                                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} ${view === 'list' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <FileText size={20} className="shrink-0" />
                                {isSidebarOpen && <span>All Posts</span>}
                            </button>
                            <button
                                onClick={() => { setCurrentBlog(null); setView('edit'); }}
                                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} ${view === 'edit' && !currentBlog ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <Edit3 size={20} className="shrink-0" />
                                {isSidebarOpen && <span>New Post</span>}
                            </button>
                            <button
                                onClick={() => setView('embed')}
                                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} ${view === 'embed' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <Code2 size={20} className="shrink-0" />
                                {isSidebarOpen && <span>Distribution</span>}
                            </button>
                            <button
                                onClick={() => { setCurrentBlog(null); setView('feed'); }}
                                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} ${view === 'feed' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <Globe size={20} className="shrink-0" />
                                {isSidebarOpen && <span>Platform Feed</span>}
                            </button>
                        </nav>

                        <div className="mt-10">
                            <h3 className={`text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ${isSidebarOpen ? 'ml-4' : 'text-center'}`}>
                                {isSidebarOpen ? 'Growth Center' : 'GRO'}
                            </h3>
                            <nav className="flex flex-col gap-1">
                                <button
                                    onClick={() => window.open('/preview', '_blank')}
                                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} text-gray-500 hover:bg-gray-50 hover:text-gray-900`}
                                >
                                    <Eye size={20} className="shrink-0" />
                                    {isSidebarOpen && <span>Live Preview</span>}
                                </button>
                                <button
                                    onClick={() => setView('analytics')}
                                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} ${view === 'analytics' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    <BarChart3 size={20} className="shrink-0" />
                                    {isSidebarOpen && <span>Advanced Analytics</span>}
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Settings & Identity */}
                    <div>
                        <h3 className={`text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ${isSidebarOpen ? 'ml-4' : 'text-center'}`}>
                            {isSidebarOpen ? 'Identity' : 'ID'}
                        </h3>
                        <nav className="flex flex-col gap-1">
                            <button
                                onClick={() => setView('branding')}
                                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} ${view === 'branding' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <Zap size={20} className="shrink-0" />
                                {isSidebarOpen && <span>Brand Settings</span>}
                            </button>
                            <button
                                onClick={() => setView('business')}
                                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} ${view === 'business' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <Briefcase size={20} className="shrink-0" />
                                {isSidebarOpen && <span>Growth Suite</span>}
                            </button>
                            <button
                                onClick={() => setView('account')}
                                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} ${view === 'account' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <Settings size={20} className="shrink-0" />
                                {isSidebarOpen && <span>Account</span>}
                            </button>
                            <button
                                onClick={() => setView('profile')}
                                className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-sm transition-all font-semibold ${!isSidebarOpen && 'justify-center px-0'} ${view === 'profile' ? 'bg-gray-900 text-white shadow-md shadow-gray-900/10' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                            >
                                <UserIcon size={20} className="shrink-0" />
                                {isSidebarOpen && <span>Creator Profile</span>}
                            </button>
                        </nav>
                    </div>
                </div>

                {/* Fixed Profile Section at bottom of sidebar */}
                <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50/50 shrink-0 z-30">
                    <div className={`flex ${isSidebarOpen ? 'flex-col items-start gap-3' : 'flex-col items-center gap-3'} w-full`}>
                        <div className="flex items-center gap-3 overflow-hidden w-full bg-white p-2 rounded-2xl border border-gray-200/50 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            {isSidebarOpen && (
                                <div className="flex flex-col truncate pr-2">
                                    <span className="text-sm font-bold text-gray-900 truncate">{user?.username || 'User'}</span>
                                    <span className="text-[10px] text-gray-500 font-semibold truncate">{user?.email || 'user@example.com'}</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onLogout}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-500 font-semibold hover:text-red-600 hover:bg-red-50 transition-colors ${!isSidebarOpen && 'w-full justify-center px-0'} ${isSidebarOpen && 'w-full'}`}
                            title="Logout"
                        >
                            <LogOut size={18} />
                            {isSidebarOpen && <span className="text-sm">Log out securely</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-h-screen overflow-y-auto bg-[#FAFAFA] relative flex flex-col">
                {/* List View */}
                {view === 'list' && (
                    <div className="p-8 md:p-12 mb-20 max-w-7xl mx-auto animate-fade-in w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-500 mb-2">
                                    Welcome back, {user?.username?.split(' ')[0] || 'Creator'}
                                </h1>
                                <p className="text-textMuted text-base font-medium">Here's what's happening with your content today.</p>
                            </div>
                            <div className="flex w-full md:w-auto items-center gap-4">
                                <div className="relative w-full md:w-72">
                                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search articles..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white border border-gray-200/60 pl-11 pr-4 py-3 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => { setCurrentBlog(null); setView('edit'); }}
                                    className="bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                                >
                                    <Plus size={18} />
                                    New Post
                                </button>
                            </div>
                        </div>

                        {/* Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col items-start gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FileText size={22} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold mb-1">Total Articles</p>
                                    <p className="text-3xl font-black text-gray-900">{blogs.length}</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col items-start gap-4 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-[100px] -z-10"></div>
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Check size={22} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold mb-1">Published</p>
                                    <p className="text-3xl font-black text-gray-900">{blogs.filter(b => b.status === 'published').length}</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col items-start gap-4 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-[100px] -z-10"></div>
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Edit3 size={22} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold mb-1">Drafts</p>
                                    <p className="text-3xl font-black text-gray-900">{blogs.filter(b => b.status === 'draft' || !b.status).length}</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col items-start gap-4 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-[100px] -z-10"></div>
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <TrendingUp size={22} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-semibold mb-1">Total Views</p>
                                    <p className="text-3xl font-black text-gray-900">{(blogs.length * 240).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 mb-8 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === 'all' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                            >All Posts</button>
                            <button
                                onClick={() => setStatusFilter('published')}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === 'published' ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                            >Live</button>
                            <button
                                onClick={() => setStatusFilter('draft')}
                                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${statusFilter === 'draft' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
                            >Drafts</button>
                        </div>

                        {blogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-32 px-6 border-2 border-dashed border-gray-200 rounded-[2rem] bg-white/50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 pointer-events-none"></div>
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                                    <FileText size={32} className="text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">No publications yet</h3>
                                <p className="text-gray-500 text-center text-base mb-8 max-w-sm relative z-10">Your writing journey begins here. Create your first cinematic post.</p>
                                <button onClick={() => { setCurrentBlog(null); setView('edit'); }} className="bg-primary hover:bg-primaryHover text-white px-8 py-3.5 rounded-2xl font-bold text-base flex items-center gap-2 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all relative z-10">
                                    Start Writing
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBlogs.map(blog => (
                                    <div key={blog.id || blog._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col overflow-hidden group">
                                        <div className="h-48 bg-gray-50 flex items-center justify-center relative overflow-hidden border-b border-gray-100">
                                            {blog.coverImage ? (
                                                <img src={blog.coverImage} className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-500" alt="Cover" />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                                                    <FileText size={48} className="text-gray-200" />
                                                </div>
                                            )}

                                            {/* Absolute positioned status pill on the image */}
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md shadow-sm ${blog.status === 'published' ? 'bg-emerald-500/90 text-white border-emerald-400' : 'bg-amber-500/90 text-white border-amber-400'}`}>
                                                    {blog.status === 'published' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                                                    {blog.status || 'draft'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 mb-4 group-hover:text-primary transition-colors">{blog.title}</h3>

                                            <div className="flex items-center text-xs text-gray-400 font-semibold mb-6">
                                                <span>{new Date(blog.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                                                <div className="flex flex-col gap-1.5 cursor-help" title="SEO Health Score">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">SEO Health</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-6 h-1 rounded-full ${blog.metaDescription ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                                                        <div className={`w-6 h-1 rounded-full ${blog.metaDescription ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                                                        <div className={`w-6 h-1 rounded-full ${blog.title && blog.title.length > 10 ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                                    <button
                                                        onClick={() => { setCurrentBlog(blog); setView('edit'); }}
                                                        className="h-9 w-9 flex items-center justify-center bg-gray-50 hover:bg-primary/10 rounded-xl text-gray-500 hover:text-primary transition-colors"
                                                        title="Edit Post"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(blog.id || blog._id)}
                                                        className="h-9 w-9 flex items-center justify-center bg-gray-50 hover:bg-red-50 rounded-xl text-gray-500 hover:text-red-500 transition-colors"
                                                        title="Delete Post"
                                                    >
                                                        <Trash2 size={16} />
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
                    <AdminClientsSection
                        clients={allClients}
                        onRefresh={fetchAllClients}
                    />
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
                    <ProfileSection />
                )}

                {view === 'feed' && (
                    <FeedSection />
                )}
            </main>
        </div>
    );
}

function ProfileSection() {
    const [profile, setProfile] = useState({ name: '', bio: '', profilePicUrl: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/users/profile/me');
                setProfile({ name: res.data.name || '', bio: res.data.bio || '', profilePicUrl: res.data.profilePicUrl || '' });
            } catch (e) { console.error(e); }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            await axios.put('/api/users/profile', profile);
            alert('Profile saved!');
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
            const res = await axios.get('http://localhost:5000/api/feed');
            setFeed(res.data);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchFeed(); }, []);

    const toggleLike = async (id) => {
        try {
            const res = await axios.post(`http://localhost:5000/api/blogs/${id}/like`);
            setFeed(feed.map(b => b.id === id ? { ...b, likes: res.data } : b));
        } catch (e) { console.error(e); }
    };

    const loadComments = async (id) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/blogs/${id}/comments`);
            setComments({ ...comments, [id]: res.data });
            setActiveCommentPost(activeCommentPost === id ? null : id);
        } catch (e) { console.error(e); }
    };

    const submitComment = async (id) => {
        if (!commentText.trim()) return;
        try {
            const res = await axios.post(`http://localhost:5000/api/blogs/${id}/comments`, { text: commentText });
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

    const generateSnippet = () => {
        const themeAttr = theme !== 'light' ? ` data-theme="${theme}"` : '';
        const selectedTarget = selectedBlogId === 'all' ? '' : ` data-blog-id="${selectedBlogId}"`;
        const serverUrl = window.location.origin;
        const scriptUrl = `${serverUrl}/api/embed.js?key=${client?.apiKey || 'YOUR_API_KEY'}`;

        if (embedMode === 'static') {
            return `<!-- LexiBlog Embed -->\n<div id="blog-embed-container" ${selectedTarget} ${themeAttr}></div>\n<script src="${scriptUrl}"></script>`;
        } else {
            return `// Fetch API Payload\nfetch("${serverUrl}/api/public/blogs${selectedBlogId !== 'all' ? `/${selectedBlogId}` : ''}", {\n  headers: {"x-api-key": "${client?.apiKey || 'YOUR_API_KEY'}" }\n})\n.then(res => res.json())\n.then(data => console.log(data));`;
        }
    };

    return (
        <div className="p-8 md:p-12 max-w-5xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-extrabold text-textMain tracking-tight mb-8">Embed Widget</h2>
            <div className="glass-card-premium p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-2">Select Target</label>
                        <select
                            value={selectedBlogId}
                            onChange={(e) => setSelectedBlogId(e.target.value)}
                            className="w-full bg-surface border border-border px-4 py-3 rounded-xl text-sm"
                        >
                            <option value="all">Full News Feed</option>
                            {blogs.map(b => (
                                <option key={b.id || b._id} value={b.id || b._id}>
                                    {b.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-2">Visual Theme</label>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            className="w-full bg-surface border border-border px-4 py-3 rounded-xl text-sm capitalize"
                        >
                            <option value="light">Classic Light</option>
                            <option value="dark">Pro Dark</option>
                            <option value="ocean">Ocean Pulse</option>
                            <option value="midnight">Midnight Express</option>
                            <option value="cyberpunk">Cybernetic</option>
                            <option value="notion">Minimalist (Notion)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-2">Integration</label>
                        <div className="flex bg-surfaceHover p-1 rounded-xl border border-border">
                            <button
                                onClick={() => setEmbedMode('static')}
                                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${embedMode === 'static' ? 'bg-white text-primary shadow-sm' : 'text-textMuted hover:text-textMain'}`}
                            >
                                HTML
                            </button>
                            <button
                                onClick={() => setEmbedMode('dynamic')}
                                className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${embedMode === 'dynamic' ? 'bg-white text-primary shadow-sm' : 'text-textMuted hover:text-textMain'}`}
                            >
                                API
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-2">Your Embed Code</label>
                    <pre className="p-4 bg-gray-950 text-emerald-400 rounded-xl text-xs overflow-x-auto border border-gray-800 font-mono leading-relaxed">
                        {generateSnippet()}
                    </pre>
                </div>

                <div className="pt-6 border-t border-border">
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-4">Live Preview</label>
                    <div className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50 shadow-inner relative overflow-hidden min-h-[300px]">
                        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                            <span className="px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-black uppercase text-gray-500 border border-gray-200 shadow-sm flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${embedMode === 'static' ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`}></span>
                                {embedMode} | Theme: {theme}
                            </span>
                        </div>

                        {embedMode === 'static' ? (
                            <div className="w-full h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
                                {/* Simulated Webpage Header */}
                                <div className="h-8 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                </div>
                                {/* User's Simulated Website Body */}
                                <div className="p-6 h-full overflow-y-auto">
                                    <div className="h-4 w-3/4 bg-gray-100 rounded mb-4"></div>
                                    <div className="h-4 w-1/2 bg-gray-100 rounded mb-8"></div>

                                    {/* Script Simulation Container */}
                                    <div className="border-2 border-dashed border-primary/30 p-4 rounded-xl relative">
                                        <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-primary tracking-widest uppercase">Your Widget</div>
                                        <div className="space-y-4">
                                            {selectedBlogId === 'all' ? (
                                                blogs.slice(0, 2).map((b, i) => (
                                                    <div key={i} className={`p-4 rounded-lg bg-gray-50 ${theme !== 'light' ? 'bg-gray-900 border-gray-800' : 'border border-gray-100'}`}>
                                                        <div className={`h-4 w-2/3 rounded mb-2 ${theme !== 'light' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                                        <div className={`h-3 w-full rounded ${theme !== 'light' ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className={`p-4 rounded-lg bg-gray-50 ${theme !== 'light' ? 'bg-gray-900 border-gray-800' : 'border border-gray-100'}`}>
                                                    <div className={`h-6 w-3/4 rounded mb-3 ${theme !== 'light' ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                                                    <div className={`h-3 w-full rounded mb-1.5 ${theme !== 'light' ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
                                                    <div className={`h-3 w-5/6 rounded ${theme !== 'light' ? 'bg-gray-800' : 'bg-gray-100'}`}></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 rounded-xl font-mono text-xs text-emerald-400 p-6 shadow-inner">
                                <Activity size={32} className="mb-4 text-emerald-500 opacity-50" />
                                <p className="mb-2 opacity-70">// Raw Data Stream Ready</p>
                                <p>Status: <span className="text-white">200 OK</span></p>
                                <p>Endpoint: <span className="text-white">/api/public/blogs{selectedBlogId !== 'all' ? `/${selectedBlogId}` : ''}</span></p>
                                <p className="mt-4 animate-pulse">Waiting for client request...</p>
                            </div>
                        )}
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
            await axios.put(`/api/admin/clients/${id}/tier`, { tier });
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
    const [logoUrl, setLogoUrl] = useState(client.brandSettings?.logoUrl || '');
    const [primaryColor, setPrimaryColor] = useState(client.brandSettings?.primaryColor || '#4f46e5');
    const [footerText, setFooterText] = useState(client.brandSettings?.footerText || '');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await axios.put('/api/clients/me/branding', {
                logoUrl, primaryColor, footerText
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

    return (
        <div className="p-8 md:p-12 max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-extrabold text-textMain tracking-tight mb-8">Brand Identity</h2>
            <div className="glass-card-premium p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-2">Platform Logo URL</label>
                        <input
                            type="text"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            className="w-full bg-surface border border-border px-4 py-3 rounded-xl text-sm"
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="text-[10px] text-textMuted mt-2 italic">SVG or PNG recommended (max height 40px).</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-2">Primary Accent Color</label>
                        <div className="flex gap-3">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-12 h-12 bg-transparent border-0 cursor-pointer p-0"
                            />
                            <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="flex-1 bg-surface border border-border px-4 py-3 rounded-xl text-sm font-mono uppercase"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-textMuted uppercase tracking-widest block mb-2">Embed Footer Text</label>
                    <input
                        type="text"
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        className="w-full bg-surface border border-border px-4 py-3 rounded-xl text-sm"
                        placeholder="Powered by [Your Brand]"
                    />
                </div>

                <div className="pt-8 border-t border-border flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-8 rounded border border-border bg-gray-50 flex items-center justify-center overflow-hidden">
                            {logoUrl ? <img src={logoUrl} alt="Preview" className="h-4 w-auto" /> : <span className="text-[8px] font-bold text-textMuted">Logo</span>}
                        </div>
                        <div className="w-8 h-8 rounded-full shadow-inner" style={{ backgroundColor: primaryColor }}></div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-primary"
                    >
                        {saving ? 'Updating...' : 'Apply Identity'}
                    </button>
                </div>
            </div>

            {/* Visual Context */}
            <div className="mt-12 p-8 border border-dashed border-border rounded-3xl bg-surface/30">
                <h4 className="text-xs font-black text-textMuted uppercase tracking-widest mb-6 text-center">Identity Applied in Widget</h4>
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-border animate-pulse">
                    <div className="h-12 px-4 shadow-sm flex items-center justify-between" style={{ borderBottom: `2px solid ${primaryColor}` }}>
                        <div className="h-4 w-20 bg-gray-100 rounded"></div>
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="h-2 w-full bg-gray-50 rounded"></div>
                        <div className="h-2 w-[80%] bg-gray-50 rounded"></div>
                        <div className="h-2 w-[60%] bg-gray-50 rounded"></div>
                    </div>
                    <div className="p-3 bg-gray-50 text-[8px] text-center font-bold" style={{ color: primaryColor }}>
                        {footerText || 'LexiBlog Platform'}
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

