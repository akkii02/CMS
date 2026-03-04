import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
    Layout, Zap, Shield, Globe, Code, Cpu, MessageSquare,
    ArrowRight, CheckCircle, Maximize, Edit3, Layers, Type,
    Sparkles, MousePointer2, Lock, Terminal, Box, Play, Eye,
    RefreshCw, Heart, Activity, Send
} from 'lucide-react';
import ThreeBackground from './ThreeBackground';

const LandingPage = () => {
    const [stats, setStats] = useState({ totalBlogs: 0, pioneerCount: 0, availableSlots: 10, uptime: '99%' });
    const [playgroundTheme, setPlaygroundTheme] = useState('light');
    const [playgroundText, setPlaygroundText] = useState('Building the future of content...');
    // 3D Tilt State
    const [heroRotation, setHeroRotation] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth - 0.5) * 15; // Max 15 degree rotation
        const y = (e.clientY / innerHeight - 0.5) * -15; // Max 15 degree rotation
        setHeroRotation({ x, y });
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/public/stats');
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats');
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="flex flex-col w-full bg-background text-textMain font-sans selection:bg-primary/10 overflow-x-hidden min-h-screen">
            {/* Minimalist Premium Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-12 md:py-6 animate-slide-down">
                <div className="max-w-7xl mx-auto flex items-center justify-between glass-pill px-8 py-4 rounded-full">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <Sparkles size={20} className="text-accent-light" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-textMain group-hover:text-primary transition-colors">PublishPro</span>
                    </div>

                    <div className="hidden md:flex items-center gap-10 text-sm font-bold text-textMuted justify-center absolute left-1/2 -translate-x-1/2">
                        <Link to="/feed" className="flex items-center gap-1.5 text-emerald-500 hover:text-emerald-400 transition-colors hover:-translate-y-0.5 transform"><Globe size={14} /> Live Feed</Link>
                        <a href="#playground" className="hover:text-primary transition-colors hover:-translate-y-0.5 transform">Live Editor</a>
                        <a href="#features" className="hover:text-primary transition-colors hover:-translate-y-0.5 transform">The Engine</a>
                        <a href="#ai-architect" className="flex items-center gap-1.5 text-accent hover:text-accent-hover transition-colors hover:-translate-y-0.5 transform">
                            <Sparkles size={14} /> AI Architect
                        </a>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link to="/login" className="hidden sm:block text-sm font-bold text-textMain hover:text-primary transition-colors">Sign In</Link>
                        <Link to="/login" className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 text-sm font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
                            Start Building <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Immersive Hero Section */}
            <section
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHeroRotation({ x: 0, y: 0 })}
                className="relative min-h-[100vh] flex flex-col items-center justify-center pt-32 pb-20 mesh-gradient overflow-hidden hidden-mesh perspective-[2000px]"
            >
                <ThreeBackground />

                {/* Decorative floating blobs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob [animation-delay:2s] pointer-events-none"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob [animation-delay:4s] pointer-events-none"></div>

                <div
                    className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center transition-transform duration-200 ease-out preserve-3d"
                    style={{ transform: `rotateX(${heroRotation.y}deg) rotateY(${heroRotation.x}deg)` }}
                >
                    <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full glass-card-premium text-xs font-black text-textMain uppercase tracking-[0.2em] mb-12 animate-fade-in hover:scale-105 transition-transform cursor-pointer border border-white/40 shadow-xl" style={{ transform: 'translateZ(60px)' }}>
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                        Next-Gen Publishing Engine Live
                    </div>

                    <h1 className="text-6xl md:text-[120px] font-black leading-[0.9] tracking-tighter text-reveal mb-8 animate-slide-up" style={{ transform: 'translateZ(90px)' }}>
                        Publish
                        <span className="block italic font-serif font-medium text-textMuted mt-2">Without Limits.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl md:text-2xl text-textMuted font-medium mb-12 animate-fade-in [animation-delay:200ms] leading-relaxed" style={{ transform: 'translateZ(40px)' }}>
                        A cinematic writing experience powered by <strong className="text-textMain text-shadow-sm">advanced typography</strong>.
                        Instant distribution powered by <strong className="text-accent text-shadow-sm">Shadow DOM</strong>.
                        Infinite creativity powered by a <strong className="text-textMain text-shadow-sm">Native AI Architect</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full max-w-lg mb-16 animate-fade-in [animation-delay:400ms]" style={{ transform: 'translateZ(70px)' }}>
                        <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-primary text-white rounded-full font-black text-lg hover:-translate-y-1 hover:shadow-2xl hover:bg-primaryHover transition-all flex items-center justify-center gap-3 group">
                            Open Dashboard
                            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <a href="#playground" className="w-full sm:w-auto px-10 py-5 glass-pill text-textMain rounded-full font-black text-lg flex items-center justify-center">
                            Try the Editor
                        </a>
                    </div>

                    <div className="flex items-center gap-8 mt-12 animate-fade-in [animation-delay:600ms] opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex gap-2 items-center font-black tracking-widest uppercase text-[10px]"><Zap size={14} /> Edge Native</div>
                        <div className="flex gap-2 items-center font-black tracking-widest uppercase text-[10px]"><Layers size={14} /> Shadow DOM</div>
                        <div className="flex gap-2 items-center font-black tracking-widest uppercase text-[10px]"><Sparkles size={14} /> Embedded AI</div>
                    </div>
                </div>
            </section>

            {/* Transparent Pioneer Banner */}
            <section className="py-12 bg-surface/50 border-y border-border/30 relative z-20">
                <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Complete Transparency
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-textMain tracking-tight mb-3">
                        We don't have customers yet. <span className="text-textMuted font-medium italic">Be our first legend.</span>
                    </h3>
                    <p className="text-textMuted font-medium mb-8 max-w-xl">
                        Join the platform before the masses. Shape the roadmap, get dedicated support from the founders, and lock in our pioneer pricing forever.
                    </p>
                    <Link to="/login" className="whitespace-nowrap px-8 py-4 glass-pill text-textMain border border-border/50 shadow-xl rounded-full font-black text-lg hover:-translate-y-1 hover:shadow-2xl transition-all flex items-center gap-3 group">
                        Become a Pioneer
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Feature Bento Box */}
            <section id="features" className="py-32 bg-surface/30 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-20 text-center">
                        <h2 className="text-5xl md:text-7xl font-black text-textMain tracking-tighter mb-6">The Pro's Toolkit.</h2>
                        <p className="text-2xl text-textMuted font-medium max-w-2xl mx-auto">Everything you need to write, optimize, and distribute at scale.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Shadow DOM Feature (Spans 2 columns on desktop) */}
                        <div className="md:col-span-2 p-12 rounded-[40px] bg-white border border-border/60 group hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 overflow-hidden relative shadow-lg">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent-light/30 to-transparent rounded-bl-full pointer-events-none"></div>
                            <div className="w-16 h-16 bg-surface hover:bg-surfaceHover rounded-2xl flex items-center justify-center mb-10 group-hover:bg-accent group-hover:text-white transition-colors duration-500 shadow-sm border border-border/50">
                                <Code size={32} />
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tight">Shadow Widget Tech</h3>
                            <p className="text-textMuted text-lg leading-relaxed font-medium max-w-md">
                                Embed your blog directly into any website. Our Shadow DOM engine guarantees 100% CSS isolation. Your host site's styles will never break your blog.
                            </p>
                        </div>

                        {/* Rich Media */}
                        <div className="p-12 rounded-[40px] bg-white border border-border/60 group hover:border-textMain/20 hover:shadow-2xl transition-all duration-500 shadow-lg">
                            <div className="w-16 h-16 bg-surface hover:bg-surfaceHover rounded-2xl flex items-center justify-center mb-10 group-hover:bg-textMain group-hover:text-white transition-colors duration-500 shadow-sm border border-border/50 text-textMain">
                                <Maximize size={32} />
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tight">Rich Media</h3>
                            <p className="text-textMuted text-lg leading-relaxed font-medium">
                                Drag and drop images, paste YouTube links, and write Markdown directly.
                            </p>
                        </div>

                        {/* SEO Auditor */}
                        <div className="p-12 rounded-[40px] bg-primary text-white group hover:shadow-2xl hover:shadow-primary/30 transition-all duration-500 relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 text-white backdrop-blur-md">
                                <Activity size={32} />
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tight">Target Verified</h3>
                            <p className="text-white/80 text-lg leading-relaxed font-medium">
                                Hit 100 on Lighthouse. Our background auditor analyzes keyword density and readability as you type.
                            </p>
                        </div>

                        {/* The Engine Feature */}
                        <div className="p-12 rounded-[40px] bg-white border border-border/60 group hover:border-accent/40 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 shadow-lg">
                            <div className="w-16 h-16 bg-surface hover:bg-surfaceHover rounded-2xl flex items-center justify-center mb-10 group-hover:bg-accent group-hover:text-white transition-colors duration-500 shadow-sm border border-border/50 text-textMain">
                                <Zap size={32} />
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tight">Headless Speed</h3>
                            <p className="text-textMuted text-lg leading-relaxed font-medium max-w-lg">
                                Rendered on the edge, delivered instantly. Provide an app-like experience to your readers anywhere in the world.
                            </p>
                        </div>

                        {/* AI Architect Feature */}
                        <div id="ai-architect" className="md:col-span-2 p-12 rounded-[40px] bg-gradient-to-br from-indigo-900 to-black text-white group hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 relative overflow-hidden shadow-xl border border-indigo-500/30">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-bl-full pointer-events-none"></div>
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 text-accent-light backdrop-blur-md border border-white/10">
                                <Cpu size={32} />
                            </div>
                            <h3 className="text-3xl font-black mb-4 tracking-tight">AI Architect inside.</h3>
                            <p className="text-white/80 text-lg leading-relaxed font-medium">
                                Struggling with writer's block? Unleash the Native AI Architect to generate brilliant titles, structure paragraphs effortlessly, auto-expand your thoughts, and brainstorm unlimited fresh content in seconds.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Live Playground Section */}
            <section id="playground" className="py-32 bg-background relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-left mb-20 max-w-3xl">
                        <h2 className="text-5xl md:text-7xl font-black text-textMain mb-6 tracking-tighter">Enter the Editor.</h2>
                        <p className="text-2xl text-textMuted font-medium">Experience the Lexical typing engine and test our Shadow DOM themes in real-time before signing up.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                        {/* Control Panel */}
                        <div className="glass-card-premium p-10 rounded-[40px] flex flex-col justify-between border border-border/50 shadow-2xl">
                            <div>
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-inner"><Terminal size={24} /></div>
                                    <h3 className="text-2xl font-black text-textMain tracking-tight">Widget Configurator</h3>
                                </div>

                                <div className="space-y-10">
                                    <div>
                                        <label className="text-xs font-black text-textMuted uppercase tracking-widest block mb-4 flex items-center gap-2">
                                            <Layers size={14} /> Select Theme Core
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {['light', 'dark', 'midnight', 'cyberpunk', 'notion', 'ocean'].map(t => (
                                                <button
                                                    key={t}
                                                    onClick={() => setPlaygroundTheme(t)}
                                                    className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border-2 ${playgroundTheme === t ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' : 'bg-surface border-border/50 text-textMuted hover:border-textMain/30 hover:bg-surfaceHover'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-black text-textMuted uppercase tracking-widest block mb-4 flex items-center gap-2">
                                            <Edit3 size={14} /> Live Typographic Preview
                                        </label>
                                        <textarea
                                            value={playgroundText}
                                            onChange={(e) => setPlaygroundText(e.target.value)}
                                            className="w-full bg-white border-2 border-border p-6 rounded-3xl text-lg font-medium focus:outline-none focus:border-primary transition-colors min-h-[160px] shadow-sm resize-none"
                                            placeholder="Write your groundbreaking ideas here..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex items-center justify-between text-[11px] font-black text-textMuted uppercase tracking-widest px-4 py-3 bg-surface rounded-xl border border-border/50">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-2 items-center"><Play size={14} className="text-emerald-500" /> Webpack Active</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2"><Cpu size={14} className="text-accent" /> AI Ready</div>
                                    <div className="flex items-center gap-2"><Globe size={14} className="text-primary" /> Syncing</div>
                                </div>
                            </div>
                        </div>

                        {/* Live Widget Preview */}
                        <div className={`rounded-[40px] p-2 shadow-2xl transition-all duration-700 flex flex-col ${playgroundTheme === 'dark' || playgroundTheme === 'midnight' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'} border`}>
                            <div className="h-full w-full rounded-[34px] overflow-hidden flex flex-col relative group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-emerald-500 opacity-50"></div>
                                <div className="p-6 border-b border-border/10 flex items-center justify-between bg-surface/10 backdrop-blur-sm z-10">
                                    <div className="flex gap-2">
                                        <div className="w-3.5 h-3.5 rounded-full bg-red-500/80 shadow-sm border border-red-600/20"></div>
                                        <div className="w-3.5 h-3.5 rounded-full bg-amber-500/80 shadow-sm border border-amber-600/20"></div>
                                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 shadow-sm border border-emerald-600/20"></div>
                                    </div>
                                    <div className="text-[10px] font-black text-textMain/40 uppercase tracking-[0.2em] bg-white/50 px-3 py-1 rounded-full border border-border/30">Shadow DOM Container</div>
                                </div>
                                <div className="flex-1 p-6 sm:p-10 overflow-y-auto bg-surface-dark/5">
                                    <div className={`p-10 rounded-[32px] transition-all duration-700 min-h-[400px] flex flex-col ${playgroundTheme === 'light' ? 'bg-white text-gray-900 border border-gray-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)]' :
                                        playgroundTheme === 'dark' ? 'bg-gray-800 text-white border border-gray-700 shadow-2xl' :
                                            playgroundTheme === 'midnight' ? 'bg-[#0a0a0c] text-blue-100 border border-blue-900/30 shadow-[0_0_40px_rgba(30,58,138,0.1)]' :
                                                playgroundTheme === 'cyberpunk' ? 'bg-black text-yellow-400 border-2 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.15)] drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]' :
                                                    playgroundTheme === 'notion' ? 'bg-[#fffeec] text-[#37352f] border border-[#e1dfdd] font-serif shadow-sm' :
                                                        'bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-2xl border border-white/10'
                                        }`}>
                                        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-current/10">
                                            <div className="w-12 h-12 rounded-2xl bg-current/10 flex items-center justify-center font-black text-xl">
                                                <Sparkles size={24} />
                                            </div>
                                            <div>
                                                <div className="font-black text-sm uppercase tracking-widest opacity-60">PublishPro Example</div>
                                                <div className="font-medium text-xs opacity-40">by Engineering Team</div>
                                            </div>
                                        </div>
                                        <h4 className="text-3xl sm:text-4xl font-black mb-6 leading-tight tracking-tight">The Future is Embedded.</h4>
                                        <p className="leading-relaxed opacity-90 text-lg font-medium whitespace-pre-wrap flex-1">{playgroundText || "Start typing on the left to see the magic happen..."}</p>

                                        <div className="mt-12 pt-6 border-t border-current/10 flex justify-between items-center text-xs font-black opacity-40 uppercase tracking-widest">
                                            <span>Read Time: 1 Min</span>
                                            <span>Share Article</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 border-t border-border bg-white">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-textMain text-white flex items-center justify-center font-black text-lg">
                            <Sparkles size={16} />
                        </div>
                        <span className="text-xl font-black tracking-tighter">PublishPro</span>
                    </div>
                    <p className="text-xs font-black text-textMuted uppercase tracking-[0.2em] font-mono">© 2026 Next-Gen Publishing Systems</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
