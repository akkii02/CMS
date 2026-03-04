import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    Maximize2, Minimize2, Save, Eye, Edit3,
    Check, AlertCircle, Settings2, ChevronDown,
    ChevronUp, Globe, User as UserIcon, Tag, Link2,
    Type, FileText, Image as ImageIcon, Sparkles,
    Loader2, ArrowRight, RefreshCw, Copy, CheckCircle2
} from 'lucide-react';

// Plugins
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { LexicalTypeaheadMenuPlugin } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { TreeView } from '@lexical/react/LexicalTreeView';

// Nodes
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $createParagraphNode, $createTextNode, $isElementNode, $isDecoratorNode } from 'lexical';
import { YouTubeNode } from './editor/nodes/YouTubeNode';
import { ImageNode } from './editor/nodes/ImageNode';
import { HashtagNode } from '@lexical/hashtag';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';

// Components
import ToolbarPlugin from './editor/ToolbarPlugin';
import YouTubePlugin from './editor/YouTubePlugin';
import ImagePlugin from './editor/ImagePlugin';
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import MentionsPlugin from './editor/MentionsPlugin';
import CodeHighlightPlugin from './editor/CodeHighlightPlugin';
import { analyzeSEO } from '../utils/SEOAuditor';

const URL_MATCHER = /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
const EMAIL_MATCHER = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

const MATCHERS = [
    (text) => {
        const match = URL_MATCHER.exec(text);
        if (match === null) return null;
        const fullMatch = match[0];
        return { index: match.index, length: fullMatch.length, text: fullMatch, url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}` };
    },
    (text) => {
        const match = EMAIL_MATCHER.exec(text);
        if (match === null) return null;
        const fullMatch = match[0];
        return { index: match.index, length: fullMatch.length, text: fullMatch, url: `mailto:${fullMatch}` };
    },
];

const theme = {
    paragraph: 'mb-6 leading-relaxed text-textMain/90 text-[1.1rem]',
    text: {
        bold: 'font-bold text-textMain',
        italic: 'italic text-textMain/90',
        underline: 'underline decoration-primary/30 underline-offset-4',
        strikethrough: 'line-through text-textMuted',
        code: 'bg-surfaceHover text-primary px-1.5 py-0.5 rounded text-sm font-mono border border-border/50',
    },
    heading: {
        h1: 'text-4xl sm:text-5xl font-black mb-8 text-transparent bg-clip-text bg-gradient-to-r from-textMain to-textMain/70 mt-10 tracking-tight leading-tight',
        h2: 'text-3xl font-extrabold mb-5 text-textMain mt-10 tracking-tight border-b border-border/40 pb-3',
        h3: 'text-2xl font-bold mb-4 text-primary mt-8 tracking-tight',
    },
    quote: 'border-l-4 border-primary pl-6 py-4 my-8 italic text-textMain/90 bg-gradient-to-r from-primary/10 to-transparent rounded-r-2xl text-xl font-serif shadow-sm',
    list: {
        ol: 'list-decimal pl-6 mb-6 space-y-2 marker:text-primary font-medium',
        ul: 'list-disc pl-6 mb-6 space-y-2 marker:text-primary',
        listitem: 'leading-relaxed text-textMain/90 text-[1.1rem]',
    },
    code: 'block bg-surfaceHover p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto border border-border text-textMain',
    link: 'text-primary hover:text-primaryHover underline decoration-primary/50 underline-offset-2 transition-colors cursor-pointer',
    table: 'w-full border-collapse border border-border my-6 text-textMain rounded-lg overflow-hidden',
    tableCell: 'border border-border p-3 min-w-[100px]',
    tableCellHeader: 'bg-surfaceHover font-bold text-primary border-border p-3',
    hashtag: 'bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md mx-0.5 shadow-sm border border-primary/20',
    hr: 'border-t-2 border-border/60 my-10 max-w-lg mx-auto rounded-full',
};

// Custom plugin to update initial state
function InitPlugin({ initialEditorState }) {
    const [editor] = useLexicalComposerContext();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current && initialEditorState) {
            isFirstRender.current = false;
            try {
                const parsedState = typeof initialEditorState === 'string'
                    ? initialEditorState
                    : JSON.stringify(initialEditorState);

                const initialEditorStateObj = editor.parseEditorState(parsedState);
                editor.setEditorState(initialEditorStateObj);
            } catch (e) {
                console.warn("Could not parse initial editor state", e);
            }
        }
    }, [editor, initialEditorState]);
    return null;
}

// Plugin to extract editor instance for external use
function EditorRefPlugin({ setEditorRef }) {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        setEditorRef(editor);
    }, [editor, setEditorRef]);
    return null;
}

export default function Editor({ initialData, onSave, onCancel }) {
    const [lexicalEditor, setLexicalEditor] = useState(null);
    const [title, setTitle] = useState(initialData?.title || '');
    const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
    const [slug, setSlug] = useState(initialData?.slug || '');
    const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || '');
    const [author, setAuthor] = useState(initialData?.author || '');
    const [keywords, setKeywords] = useState(initialData?.keywords || '');
    const [editorState, setEditorState] = useState(initialData?.content || null);
    const [contentHtml, setContentHtml] = useState(initialData?.contentHtml || '');
    const [status, setStatus] = useState(initialData?.status || 'draft');
    const [publishToPlatform, setPublishToPlatform] = useState(initialData?.publishToPlatform || false);
    const [category, setCategory] = useState(initialData?.category || 'General');
    const [submitting, setSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState('write'); // 'write', 'preview', 'ai'
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showProperties, setShowProperties] = useState(false);
    const [seoAnalysis, setSeoAnalysis] = useState({ score: 100, issues: [], actions: [] });

    // AI Architect State
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiStep, setAiStep] = useState(1); // 1: Prompt, 2: Select Title, 3: Generate Content
    const [suggestedTitles, setSuggestedTitles] = useState([]);
    const [selectedAiTitle, setSelectedAiTitle] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isBatchLoading, setIsBatchLoading] = useState(false);
    const [aiGeneratedContent, setAiGeneratedContent] = useState('');

    useEffect(() => {
        const analysis = analyzeSEO({ title, metaDescription, contentHtml, keywords });
        setSeoAnalysis(analysis);
    }, [title, metaDescription, contentHtml, keywords]);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isFullScreen) setIsFullScreen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isFullScreen]);

    const initialConfig = {
        namespace: 'BlogEditor',
        theme,
        onError(error) {
            console.error('Editor Error:', error);
        },
        nodes: [
            HeadingNode, ListNode, ListItemNode, QuoteNode, CodeNode,
            CodeHighlightNode, TableNode, TableCellNode, TableRowNode,
            AutoLinkNode, LinkNode, YouTubeNode, ImageNode,
            HashtagNode, HorizontalRuleNode
        ]
    };

    const handleEditorChange = (editorStateObj, editor) => {
        setEditorState(JSON.stringify(editorStateObj.toJSON()));
        editorStateObj.read(() => {
            const html = $generateHtmlFromNodes(editor, null);
            setContentHtml(html);
        });
    };

    const getWordCount = () => {
        const text = contentHtml.replace(/<[^>]*>/g, ' ').trim();
        return text ? text.split(/\s+/).length : 0;
    };

    const getReadTime = () => {
        const words = getWordCount();
        return Math.ceil(words / 200);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) {
            alert("Please provide a title.");
            return;
        }
        setSubmitting(true);
        const finalSlug = slug.trim() || title.toLowerCase().split(' ').join('-').replace(/[^a-z0-9-]/g, '');
        const contentToSave = editorState || JSON.stringify({ root: { children: [{ type: 'paragraph', children: [], direction: null, format: '', indent: 0, version: 1 }], direction: null, format: '', indent: 0, type: 'root', version: 1 } });
        onSave({ title, coverImage, slug: finalSlug, metaDescription, author, keywords, content: contentToSave, contentHtml, status, category, publishToPlatform });
        setSubmitting(false);
    };

    // --- AI Architect Functions ---
    const handleSuggestTitles = async () => {
        if (!aiPrompt.trim()) return;
        setIsAiLoading(true);
        try {
            const res = await api.post('/api/ai/suggest-titles', { prompt: aiPrompt });
            setSuggestedTitles(res.data.titles);
            setAiStep(2);
        } catch (err) {
            console.error("AI Title Error:", err);
            const msg = err.response?.data?.message || "AI Suggestion failed. Check console.";
            alert(msg);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleGenerateBlog = async () => {
        if (!selectedAiTitle) return;
        setIsAiLoading(true);
        try {
            const res = await api.post('/api/ai/generate-blog', { title: selectedAiTitle });
            setAiGeneratedContent(res.data.contentHtml);
            setAiStep(3);
        } catch (err) {
            console.error("AI Content Error:", err);
            const msg = err.response?.data?.message || "AI Generation failed. Check console.";
            alert(msg);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleBatchGenerate = async () => {
        if (!aiPrompt.trim()) return;
        setIsBatchLoading(true);
        try {
            const res = await api.post('/api/ai/batch-generate', { prompt: aiPrompt, count: 5 });
            alert(res.data.message);
            // Optionally redirect to dashboard or show success state
            setAiPrompt('');
            setViewMode('write');
        } catch (err) {
            console.error("AI Batch Error:", err);
            const msg = err.response?.data?.message || "Batch generation failed.";
            alert(msg);
        } finally {
            setIsBatchLoading(false);
        }
    };

    const applyAiContent = () => {
        setTitle(selectedAiTitle);
        setContentHtml(aiGeneratedContent);

        if (lexicalEditor) {
            lexicalEditor.update(() => {
                const root = $getRoot();
                root.clear();

                try {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(aiGeneratedContent, 'text/html');
                    const nodes = $generateNodesFromDOM(lexicalEditor, dom);

                    if (nodes && nodes.length > 0) {
                        const finalNodes = [];
                        let currentParagraph = null;

                        for (const node of nodes) {
                            if ($isElementNode(node) || $isDecoratorNode(node)) {
                                if (currentParagraph) {
                                    finalNodes.push(currentParagraph);
                                    currentParagraph = null;
                                }
                                finalNodes.push(node);
                            } else {
                                if (!currentParagraph) {
                                    currentParagraph = $createParagraphNode();
                                }
                                currentParagraph.append(node);
                            }
                        }

                        if (currentParagraph) {
                            finalNodes.push(currentParagraph);
                        }

                        root.append(...finalNodes);
                    } else {
                        const p = $createParagraphNode();
                        p.append($createTextNode(aiGeneratedContent.replace(/<[^>]+>/g, '')));
                        root.append(p);
                    }
                } catch (e) {
                    console.error("Lexical Parse Error:", e);
                    const p = $createParagraphNode();
                    p.append($createTextNode("Failed to load AI content. Check preview."));
                    root.append(p);
                }
            });
        }

        setViewMode('write');
        setAiStep(1);
        setAiPrompt('');
    };

    return (
        <div className={`flex flex-col bg-background transition-all duration-500 ${isFullScreen ? 'fixed inset-0 z-[9999] overflow-y-auto' : 'h-full rounded-xl border border-border shadow-2xl overflow-hidden'}`}>

            {/* Minimal Sticky Header for Controls */}
            <div className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/50 transition-all`}>
                <div className="flex items-center gap-4">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="text-xs font-bold text-textMuted hover:text-red-500 transition-colors mr-2"
                        >
                            CANCEL
                        </button>
                    )}
                    <div className="flex bg-surface-dark/5 p-1 rounded-lg border border-border/10">
                        <button
                            onClick={() => setViewMode('write')}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${viewMode === 'write' ? 'bg-white text-black shadow-sm' : 'text-textMuted hover:text-textMain'}`}
                        >Write</button>
                        <button
                            onClick={() => setViewMode('preview')}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${viewMode === 'preview' ? 'bg-white text-black shadow-sm' : 'text-textMuted hover:text-textMain'}`}
                        >Preview</button>
                        <button
                            onClick={() => setViewMode('ai')}
                            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-2 transition-all ${viewMode === 'ai' ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'}`}
                        >
                            <Sparkles size={12} />
                            AI Architect
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/50 ${seoAnalysis.score > 80 ? 'text-emerald-500 bg-emerald-500/5' : 'text-amber-500 bg-amber-500/5'}`}>
                        <AlertCircle size={14} />
                        <span className="text-xs font-bold">{seoAnalysis.score}% SEO</span>
                    </div>

                    <div className="flex bg-surface-dark/5 p-1 rounded-lg border border-border/10">
                        <button
                            onClick={() => setStatus('draft')}
                            className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all ${status === 'draft' ? 'bg-amber-500 text-white shadow-sm' : 'text-textMuted hover:text-textMain'}`}
                        >Draft</button>
                        <button
                            onClick={() => setStatus('published')}
                            className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest transition-all ${status === 'published' ? 'bg-emerald-500 text-white shadow-sm' : 'text-textMuted hover:text-textMain'}`}
                        >Live</button>
                    </div>

                    <button
                        onClick={() => setIsFullScreen(!isFullScreen)}
                        className="p-2 text-textMuted hover:text-textMain hover:bg-surfaceHover rounded-lg transition-all"
                        title={isFullScreen ? "Exit Full Screen (Esc)" : "Full Screen Mode"}
                    >
                        {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="btn-primary py-1.5 px-4 text-xs"
                    >
                        {submitting ? 'Saving...' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col ${isFullScreen ? 'min-h-screen' : ''}`}>

                {/* Write Mode */}
                <div className={`${viewMode === 'write' ? 'block' : 'hidden'} max-w-4xl mx-auto w-full px-8 py-12 transition-all duration-700 animate-fade-in`}>

                    {/* Cover Image Placeholder/Display */}
                    {coverImage ? (
                        <div className="relative group mb-8">
                            <img src={coverImage} alt="Cover" className="w-full h-64 object-cover rounded-2xl border border-border/50 shadow-lg" />
                            <button
                                onClick={() => setCoverImage('')}
                                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Minimize2 size={14} />
                            </button>
                        </div>
                    ) : !isFullScreen && (
                        <button
                            onClick={() => setCoverImage('https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=2070')}
                            className="flex items-center gap-2 text-textMuted hover:text-textMain mb-6 group transition-colors"
                        >
                            <ImageIcon size={18} className="group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Add cover image</span>
                        </button>
                    )}

                    {/* Large Notion-Style Title */}
                    <textarea
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Untilted Post"
                        className="w-full bg-transparent border-none focus:ring-0 text-5xl font-black text-textMain placeholder-textMuted/30 resize-none mb-4 leading-tight"
                        rows={1}
                        onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                    />

                    {/* Collapsible Properties */}
                    <div className="mb-10">
                        <button
                            onClick={() => setShowProperties(!showProperties)}
                            className="flex items-center gap-2 text-textMuted hover:text-textMain text-sm font-medium mb-3 group"
                        >
                            <Settings2 size={16} className={`${showProperties ? 'rotate-90' : ''} transition-transform`} />
                            <span>{showProperties ? 'Hide Properties' : 'Show Properties'}</span>
                            {showProperties ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {showProperties && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4 p-6 bg-surface-dark/5 rounded-2xl border border-border/30 animate-scale-in">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Link2 size={14} className="text-textMuted" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-textMuted w-24">Slug</label>
                                        <input
                                            value={slug}
                                            onChange={e => setSlug(e.target.value)}
                                            placeholder="custom-slug"
                                            className="flex-1 bg-transparent border-none text-sm p-0 focus:ring-0 text-textMain font-mono"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <UserIcon size={14} className="text-textMuted" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-textMuted w-24">Author</label>
                                        <input
                                            value={author}
                                            onChange={e => setAuthor(e.target.value)}
                                            placeholder="Author name"
                                            className="flex-1 bg-transparent border-none text-sm p-0 focus:ring-0 text-textMain"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Globe size={14} className="text-textMuted" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-textMuted w-24">Category</label>
                                        <select
                                            value={category}
                                            onChange={e => setCategory(e.target.value)}
                                            className="flex-1 bg-transparent border-none text-sm p-0 focus:ring-0 text-textMain appearance-none cursor-pointer"
                                        >
                                            <option value="General">General</option>
                                            <option value="Business">Business</option>
                                            <option value="Technology">Technology</option>
                                            <option value="News">News</option>
                                            <option value="Guide">Guide</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Tag size={14} className="text-textMuted" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-textMuted w-24">Keywords</label>
                                        <input
                                            value={keywords}
                                            onChange={e => setKeywords(e.target.value)}
                                            placeholder="seo, article, blog"
                                            className="flex-1 bg-transparent border-none text-sm p-0 focus:ring-0 text-textMain"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-1 sm:col-span-2 pt-4 border-t border-border/20 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                                    <div className="flex items-start gap-3 flex-1">
                                        <FileText size={14} className="text-textMuted mt-1" />
                                        <label className="text-[10px] font-black uppercase tracking-widest text-textMuted w-24 mt-1">SEO Meta</label>
                                        <textarea
                                            value={metaDescription}
                                            onChange={e => setMetaDescription(e.target.value)}
                                            placeholder="Search engine description..."
                                            className="flex-1 bg-transparent border-none text-sm p-0 focus:ring-0 text-textMain resize-none h-12"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 sm:pl-4 sm:border-l border-border/20">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-textMuted cursor-pointer" htmlFor="publishPlatform">Publish to Platform</label>
                                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                            <input type="checkbox" name="toggle" id="publishPlatform" checked={publishToPlatform} onChange={e => setPublishToPlatform(e.target.checked)} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-border/50 appearance-none cursor-pointer transition-transform duration-200 checked:translate-x-5 checked:border-primary" style={{ top: '2px', left: '2px' }} />
                                            <label htmlFor="publishPlatform" className="toggle-label block overflow-hidden h-6 rounded-full bg-surfaceHover border border-border cursor-pointer transition-colors duration-200" style={{ backgroundColor: publishToPlatform ? 'rgba(37, 99, 235, 0.2)' : '' }}></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Lexical Editor Body */}
                    <div className="relative group">
                        <LexicalComposer initialConfig={initialConfig}>
                            <YouTubePlugin />
                            <ImagePlugin />
                            <div className={`sticky ${isFullScreen ? 'top-16' : 'top-0'} z-40 mb-4 transition-all duration-300`}>
                                <ToolbarPlugin />
                            </div>
                            <div className="relative cursor-text prose prose-lg prose-invert max-w-none">
                                <RichTextPlugin
                                    contentEditable={<ContentEditable className="focus:outline-none min-h-[500px]" />}
                                    placeholder={<div className="absolute top-0 left-0 text-textMuted/20 pointer-events-none text-xl italic font-serif">Deep dive into your thoughts...</div>}
                                    ErrorBoundary={LexicalErrorBoundary}
                                />
                                <EditorRefPlugin setEditorRef={setLexicalEditor} />
                                <ListPlugin />
                                <LinkPlugin />
                                <AutoLinkPlugin matchers={MATCHERS} />
                                <HashtagPlugin />
                                <HorizontalRulePlugin />
                                <MentionsPlugin />
                                <CodeHighlightPlugin />
                                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                                <HistoryPlugin />
                                <TablePlugin />
                                <OnChangePlugin onChange={handleEditorChange} ignoreSelectionChange />
                                {initialData?.content && <InitPlugin initialEditorState={initialData.content} />}
                            </div>
                            {/* Debug Tree View Modal block rendering beneath the editor window dynamically */}
                            <div className="mt-8 border-t border-border/50 pt-8 opacity-70 hover:opacity-100 transition-opacity">
                                {lexicalEditor && (
                                    <TreeView
                                        viewClassName="bg-black text-gray-300 text-[11px] font-mono leading-relaxed p-6 rounded-2xl overflow-auto h-[300px] border border-gray-800 shadow-inner"
                                        timeTravelPanelClassName="bg-black border-t border-gray-800 p-2 flex items-center justify-between text-gray-400 text-xs mt-2 rounded-b-2xl"
                                        timeTravelButtonClassName="px-3 py-1 bg-gray-900 border border-gray-700 hover:bg-white hover:text-black rounded text-[10px] uppercase font-black tracking-widest transition-colors cursor-pointer"
                                        timeTravelPanelSliderClassName="w-1/2 cursor-pointer appearance-none bg-gray-800 h-1.5 rounded-full"
                                        timeTravelPanelButtonClassName="text-white hover:text-primary transition-colors text-sm px-2 cursor-pointer"
                                        editor={lexicalEditor}
                                    />
                                )}
                            </div>
                        </LexicalComposer>
                    </div>
                </div>

                {/* AI Architect Wizard */}
                <div className={`${viewMode === 'ai' ? 'flex flex-col items-center' : 'hidden'} max-w-4xl mx-auto w-full px-8 py-20 animate-fade-in`}>
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-8 animate-float-slow">
                        <Sparkles size={32} />
                    </div>
                    <h2 className="text-4xl font-black text-center mb-4 tracking-tight">AI Blog Architect</h2>
                    <p className="text-textMuted text-center mb-12 max-w-lg">Transform a simple idea into a professional blog post in seconds using Gemini Power.</p>

                    <div className="w-full glass-panel p-8 min-h-[400px] flex flex-col">
                        {/* Steps Indicator */}
                        <div className="flex items-center justify-center gap-4 mb-10">
                            {[1, 2, 3].map(step => (
                                <div key={step} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${aiStep >= step ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-border text-textMuted'}`}>
                                        {aiStep > step ? <Check size={14} /> : step}
                                    </div>
                                    {step < 3 && <div className={`w-12 h-[2px] rounded-full ${aiStep > step ? 'bg-primary' : 'bg-border'}`} />}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Prompt Input */}
                        {aiStep === 1 && (
                            <div className="animate-slide-up flex flex-col items-center">
                                <h3 className="text-xl font-bold mb-6">What do you want to write about?</h3>
                                <textarea
                                    value={aiPrompt}
                                    onChange={e => setAiPrompt(e.target.value)}
                                    placeholder="e.g. A deep dive into modern MERN stack architecture with a focus on SEO and performance..."
                                    className="w-full bg-surface-dark/5 border border-border p-6 rounded-2xl text-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none h-32 mb-8"
                                />
                                <div className="flex flex-col sm:flex-row gap-3 w-full">
                                    <button
                                        onClick={handleSuggestTitles}
                                        disabled={isAiLoading || isBatchLoading || !aiPrompt.trim()}
                                        className="flex-[2] btn-primary py-4 text-lg"
                                    >
                                        {isAiLoading ? (
                                            <><Loader2 className="animate-spin" size={20} /> Brainstorming Titles...</>
                                        ) : (
                                            <><ArrowRight size={20} /> Suggest 20 Titles</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleBatchGenerate}
                                        disabled={isAiLoading || isBatchLoading || !aiPrompt.trim()}
                                        className="flex-1 btn-secondary py-4 border-primary/30 text-primary hover:bg-primary/5"
                                    >
                                        {isBatchLoading ? (
                                            <><Loader2 className="animate-spin" size={16} /> Working...</>
                                        ) : (
                                            <><RefreshCw size={16} /> Batch Generate 5</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Select Title */}
                        {aiStep === 2 && (
                            <div className="animate-slide-up">
                                <h3 className="text-xl font-bold mb-6 flex justify-between items-center">
                                    Pick a winning title
                                    <button onClick={() => setAiStep(1)} className="text-xs text-textMuted hover:text-primary flex items-center gap-1">
                                        <RefreshCw size={12} /> Start Over
                                    </button>
                                </h3>
                                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
                                    {suggestedTitles.map((t, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedAiTitle(t)}
                                            className={`text-left p-4 rounded-xl border transition-all ${selectedAiTitle === t ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-surface/50 border-border/50 text-textMain hover:border-primary/50'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center ${selectedAiTitle === t ? 'border-primary' : 'border-border'}`}>
                                                    {selectedAiTitle === t && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                </div>
                                                <span className="font-semibold text-sm leading-snug">{t}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={handleGenerateBlog}
                                    disabled={isAiLoading || !selectedAiTitle}
                                    className="btn-primary w-full py-4 text-lg"
                                >
                                    {isAiLoading ? (
                                        <><Loader2 className="animate-spin" size={20} /> Generating Content...</>
                                    ) : (
                                        <><Sparkles size={20} /> Generate Full Blog Post</>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Step 3: Result & Apply */}
                        {aiStep === 3 && (
                            <div className="animate-slide-up">
                                <h3 className="text-xl font-bold mb-6 flex justify-between items-center">
                                    Behold your Architect's draft
                                    <div className="flex gap-2">
                                        <button onClick={() => setAiStep(2)} className="text-xs text-textMuted hover:text-primary px-3 py-1">Back</button>
                                    </div>
                                </h3>
                                <div className="bg-surface-dark/5 border border-border p-8 rounded-2xl max-h-[450px] overflow-y-auto mb-8 prose prose-sm prose-invert max-w-none">
                                    <h1 className="text-2xl font-black mb-6">{selectedAiTitle}</h1>
                                    <div dangerouslySetInnerHTML={{ __html: aiGeneratedContent }} />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setAiStep(1)}
                                        className="flex-1 btn-secondary py-4"
                                    >Discard & Restart</button>
                                    <button
                                        onClick={applyAiContent}
                                        className="flex-[2] btn-primary py-4 text-lg"
                                    >
                                        <CheckCircle2 size={20} /> Apply to Editor
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Mode */}
                <div className={`${viewMode === 'preview' ? 'block' : 'hidden'} max-w-4xl mx-auto w-full px-8 py-12 animate-fade-in`}>
                    {coverImage && <img src={coverImage} alt="Cover" className="w-full h-[400px] object-cover rounded-3xl mb-12 shadow-2xl" />}
                    <h1 className="text-6xl font-black text-textMain mb-10 leading-tight tracking-tight">{title || 'Untitled Story'}</h1>

                    <div className="flex items-center gap-6 mb-12 pb-8 border-b border-border/30 text-textMuted font-medium italic">
                        <span>Published under <strong>{category}</strong></span>
                        <div className="w-1.5 h-1.5 rounded-full bg-border" />
                        <span>{getReadTime()} min read</span>
                        {author && (
                            <>
                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                                <span>By {author}</span>
                            </>
                        )}
                    </div>

                    <div
                        className="blog-body prose prose-xl shadow-none prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-textMain prose-headings:font-black prose-a:text-primary prose-img:rounded-3xl prose-pre:rounded-2xl"
                        dangerouslySetInnerHTML={{ __html: contentHtml || '<p class="text-textMuted italic">Your story is still unwritten...</p>' }}
                    />
                </div>
            </div>

            {/* Subtle Floating Footer (Only in Full Screen) */}
            {isFullScreen && viewMode === 'write' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-3 bg-black/90 text-white rounded-full border border-white/10 shadow-2xl backdrop-blur-xl animate-bounce-subtle z-[9999] opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black uppercase tracking-widest border-r border-white/20 pr-6 mr-2">PublishPro Distraction-Free</span>
                    <div className="flex items-center gap-4 text-[10px] font-bold">
                        <span>{getWordCount()} words</span>
                        <span>{getReadTime()} min read</span>
                    </div>
                    <button
                        onClick={() => setIsFullScreen(false)}
                        className="flex items-center gap-2 pl-6 ml-2 border-l border-white/20 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                        Exit
                        <Minimize2 size={12} />
                    </button>
                </div>
            )}
        </div>
    );
}
