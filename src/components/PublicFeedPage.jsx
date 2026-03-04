import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Sparkles, ArrowRight, Heart, MessageSquare, Send, Globe } from 'lucide-react';

const PublicFeedPage = () => {
    const navigate = useNavigate();
    const [feed, setFeed] = useState([]);
    const [feedLoading, setFeedLoading] = useState(true);
    const [commentText, setCommentText] = useState('');
    const [activeCommentPost, setActiveCommentPost] = useState(null);
    const [expandedPost, setExpandedPost] = useState(null);
    const [comments, setComments] = useState({});

    // Fetch user for like status rendering (null if completely logged out)
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await api.get('/api/feed');
                setFeed(res.data);
            } catch (err) { }
            setFeedLoading(false);
        };
        fetchFeed();
    }, []);

    const toggleLike = async (id) => {
        if (!user) {
            navigate('/login');
            return;
        }
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
        if (!user) {
            navigate('/login');
            return;
        }
        if (!commentText.trim()) return;
        try {
            const res = await api.post(`/api/blogs/${id}/comments`, { text: commentText });
            const list = comments[id] || [];
            setComments({ ...comments, [id]: [res.data, ...list] });
            setCommentText('');
        } catch (e) { console.error(e); }
    };

    return (
        <div className="flex flex-col w-full bg-surface-dark text-textMain font-sans selection:bg-primary/10 overflow-x-hidden min-h-screen">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-border/50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                            <Sparkles size={20} className="text-accent-light" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-textMain group-hover:text-primary transition-colors">PublishPro</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <Link to="/" className="text-sm font-bold text-textMuted hover:text-primary transition-colors">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="hidden sm:block text-sm font-bold text-textMain hover:text-primary transition-colors">Sign In</Link>
                                <Link to="/login" className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300">
                                    Join Network
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Public Platform Feed Section */}
            <main className="flex-1 max-w-3xl mx-auto px-6 py-12 w-full">
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-textMain tracking-tighter mb-4 flex items-center gap-3">
                        <Globe className="text-primary" size={36} /> The Global Feed
                    </h1>
                    <p className="text-lg text-textMuted font-medium">Discover groundbreaking articles published directly to the community.</p>
                </div>

                {feedLoading ? (
                    <div className="py-20 text-center text-textMuted font-black uppercase tracking-widest text-sm animate-pulse">Loading Live Feed...</div>
                ) : (
                    <div className="flex flex-col gap-10">
                        {feed.length === 0 && <div className="p-12 border border-dashed border-border/50 text-center rounded-3xl bg-surface/50 text-textMuted font-medium text-lg">No public posts yet. Check back soon!</div>}

                        {feed.map(blog => {
                            const isLiked = blog.likes?.includes(user?._id) || blog.likes?.includes('000000000000000000000000');
                            return (
                                <article key={blog.id} className="bg-white rounded-[32px] overflow-hidden border border-border/80 shadow-sm hover:shadow-xl transition-shadow duration-300">
                                    {blog.coverImage && <img src={blog.coverImage} className="w-full h-[400px] object-cover border-b border-border/50" alt="Cover" />}
                                    <div className="p-8 md:p-10">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex-shrink-0"></div>
                                            <div>
                                                <div className="font-bold text-textMain text-sm">{blog.author || 'Pioneer Writer'}</div>
                                                <div className="text-[11px] font-bold text-textMuted uppercase tracking-widest">{new Date(blog.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        <h2 className="text-3xl font-black text-textMain leading-[1.2] mb-4 hover:text-primary cursor-pointer transition-colors">{blog.title}</h2>

                                        <div className="mb-4">
                                            <span className="px-3 py-1 bg-surfaceHover text-textMuted text-[10px] font-black uppercase rounded-lg border border-border inline-block">{blog.category}</span>
                                        </div>

                                        <div className={`prose prose-lg prose-invert text-textMuted mb-2 font-medium ${expandedPost === blog.id ? '' : 'line-clamp-3'}`} dangerouslySetInnerHTML={{ __html: blog.contentHtml }} />

                                        {blog.contentHtml && blog.contentHtml.length > 200 && (
                                            <button
                                                onClick={() => setExpandedPost(expandedPost === blog.id ? null : blog.id)}
                                                className="text-primary text-sm font-black mb-8 hover:underline uppercase tracking-wide mt-2 inline-flex"
                                            >
                                                {expandedPost === blog.id ? 'Show Less' : 'Read Full Article'}
                                            </button>
                                        )}

                                        <div className="flex items-center gap-8 pt-6 mt-2 border-t border-border/60">
                                            <button onClick={() => toggleLike(blog.id)} className={`flex items-center gap-2 text-sm font-black transition-transform hover:scale-105 ${isLiked ? 'text-rose-500 hover:text-rose-600' : 'text-textMuted hover:text-textMain'}`}>
                                                <Heart size={20} className={isLiked ? 'fill-current text-rose-500' : ''} />
                                                {blog.likes?.length || 0}
                                            </button>
                                            <button onClick={() => loadComments(blog.id)} className="flex items-center gap-2 text-sm font-black text-textMuted hover:text-primary transition-transform hover:scale-105">
                                                <MessageSquare size={20} />
                                                {comments[blog.id] ? 'Hide Comments' : 'Comments'}
                                            </button>
                                        </div>

                                        {activeCommentPost === blog.id && (
                                            <div className="mt-8 pt-8 border-t border-border/60 animate-slide-down bg-surfaceHover/30 -mx-10 -mb-10 px-10 pb-10 rounded-b-[32px]">
                                                <div className="flex gap-3 mb-8 relative">
                                                    <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Add a comment... (Login Required)" className="flex-1 bg-white border border-border pl-6 pr-14 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-shadow placeholder:text-textMuted/60 shadow-inner" />
                                                    <button onClick={() => submitComment(blog.id)} className="absolute right-2.5 top-2.5 bottom-2.5 btn-primary px-4 rounded-xl shadow-md"><Send size={16} /></button>
                                                </div>
                                                <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                                    {(comments[blog.id] || []).map(c => (
                                                        <div key={c._id} className="flex gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center border border-border/80 shadow-sm mt-1">
                                                                {c.userId?.profilePicUrl ? <img src={c.userId.profilePicUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600"></div>}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="bg-white p-5 rounded-3xl rounded-tl-sm border border-border/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <span className="text-sm font-black text-textMain tracking-tight">{c.userId?.name || 'Pioneer User'}</span>
                                                                        <span className="text-[10px] uppercase tracking-widest text-textMuted font-bold">{new Date(c.createdAt).toLocaleDateString()}</span>
                                                                    </div>
                                                                    <p className="text-sm text-textMain/80 leading-relaxed font-medium">{c.text}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {(comments[blog.id] || []).length === 0 && <p className="text-xs font-black uppercase tracking-widest text-textMuted/50 text-center py-8">Be the first to share your thoughts.</p>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PublicFeedPage;
