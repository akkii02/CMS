import { useState, useEffect } from 'react';
import api from '../services/api';
import { ArrowLeft } from 'lucide-react';

export default function PreviewPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlog, setSelectedBlog] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const res = await api.get('/api/blogs');
                setBlogs(res.data);

                // Allow direct linking to a specific blog via hash
                const hashId = window.location.hash.substring(1);
                if (hashId) {
                    const found = res.data.find(b => b.id === hashId || b.slug === hashId);
                    if (found) setSelectedBlog(found);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    // Inject SEO Metadata when the selected blog loads or changes
    useEffect(() => {
        if (selectedBlog) {
            document.title = selectedBlog.title ? `${selectedBlog.title} - PublishPro` : 'PublishPro Preview';

            // Check if meta description already exists
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = 'description';
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = selectedBlog.metaDescription || `Read ${selectedBlog.title} on PublishPro.`;
        } else {
            document.title = 'PublishPro Preview';
        }
    }, [selectedBlog]);

    // These styles mimic the embed script's styles (now Light Theme)
    return (
        <div className="min-h-screen bg-background text-textMain p-6 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
                {/* Header */}
                <div className="w-full flex justify-between items-center mb-10 border-b border-border pb-6">
                    <h1 className="text-3xl font-extrabold text-textMain tracking-tight">
                        Live Preview Mode
                    </h1>
                    <button
                        onClick={() => window.close()}
                        className="px-4 py-2 bg-surface hover:bg-surfaceHover border border-border rounded-lg transition-colors text-sm font-medium text-textMain shadow-sm"
                    >
                        Close Preview
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-textMuted">Loading blogs...</div>
                ) : (
                    <>
                        {!selectedBlog ? (
                            /* List View */
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                {blogs.length === 0 ? (
                                    <div className="col-span-full text-center py-20 text-textMuted">No blogs found.</div>
                                ) : (
                                    blogs.map(blog => (
                                        <div
                                            key={blog.id}
                                            onClick={() => setSelectedBlog(blog)}
                                            className="bg-surface border border-border hover:border-primary/50 hover:shadow-xl rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1 flex flex-col group"
                                        >
                                            {blog.coverImage ? (
                                                <img src={blog.coverImage} className="w-full h-48 object-cover border-b border-border" alt="" />
                                            ) : (
                                                <div className="w-full h-3 bg-primary/20"></div>
                                            )}
                                            <div className="p-6 flex-1 flex flex-col justify-between">
                                                <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors text-textMain tracking-tight">{blog.title}</h2>
                                                <p className="text-sm text-textMuted font-medium">
                                                    {new Date(blog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            /* Detail View */
                            <div className="bg-surface border border-border rounded-3xl overflow-hidden animate-fade-in shadow-xl w-full">
                                <button
                                    onClick={() => setSelectedBlog(null)}
                                    className="flex items-center gap-2 m-6 px-4 py-2 bg-surfaceHover hover:bg-border text-textMuted hover:text-textMain rounded-lg transition-colors text-sm font-medium w-fit border border-border"
                                >
                                    <ArrowLeft size={16} />
                                    Back to overview
                                </button>

                                {selectedBlog.coverImage && (
                                    <img src={selectedBlog.coverImage} className="w-full max-h-[400px] object-cover border-b border-border" alt="Cover" />
                                )}

                                <div className="p-8 md:p-14">
                                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight tracking-tight text-textMain">
                                        {selectedBlog.title}
                                    </h1>
                                    <p className="text-textMuted font-medium mb-10 pb-8 border-b border-border">
                                        {new Date(selectedBlog.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>

                                    {/* The Professional HTML Content */}
                                    <div
                                        className="blog-body prose prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-surfaceHover prose-pre:border prose-pre:border-border prose-img:rounded-2xl"
                                        dangerouslySetInnerHTML={{ __html: selectedBlog.contentHtml || '<p class="text-textMuted italic">No HTML content available for this legacy post.</p>' }}
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <style>{`
                /* Add some base overrides for the injected HTML matching silent light theme */
                .blog-body h1 { font-size: 2.5em; font-weight: 800; margin-top: 2em; margin-bottom: 0.8em; color: #2D2A26; letter-spacing: -0.02em; }
                .blog-body h2 { font-size: 1.8em; font-weight: 700; margin-top: 1.8em; margin-bottom: 0.8em; color: #2D2A26; letter-spacing: -0.01em; }
                .blog-body h3 { font-size: 1.4em; font-weight: 700; margin-top: 1.5em; margin-bottom: 0.8em; color: #2D2A26; }
                .blog-body p { margin-bottom: 1.5em; font-size: 1.15rem; color: #514A43; line-height: 1.8; }
                .blog-body ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1.5em; color: #8A7E71; }
                .blog-body ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1.5em; color: #8A7E71; }
                .blog-body li { margin-bottom: 0.5em; color: #514A43; }
                .blog-body a { color: #8A7E71; text-decoration: underline; text-underline-offset: 4px; }
                .blog-body blockquote { border-left: 4px solid #8A7E71; font-style: italic; color: #8A7E71; margin: 2em 0; background: rgba(138, 126, 113, 0.05); padding: 20px 28px; border-radius: 0 12px 12px 0; }
                .blog-body code { background: rgba(138, 126, 113, 0.1); padding: 3px 6px; border-radius: 6px; font-family: monospace; font-size: 0.9em; border: 1px solid rgba(138, 126, 113, 0.1); color: #8A7E71; }
                .blog-body pre { background: #FFFFFF; color: #514A43; padding: 24px; border-radius: 12px; overflow-x: auto; font-family: monospace; font-size: 0.9em; margin: 2em 0; border: 1px solid #E5E2DB; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
                .blog-body pre code { background: transparent; border: none; padding: 0; color: inherit; }
                
                /* Video Wrapper Styles */
                .editor-youtube-wrapper { margin: 2em 0 !important; }
                
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-justify { text-align: justify; }
            `}</style>
        </div>
    );
}
