import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    FORMAT_TEXT_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    UNDO_COMMAND,
    REDO_COMMAND,
    CLEAR_EDITOR_COMMAND,
    INDENT_CONTENT_COMMAND,
    OUTDENT_CONTENT_COMMAND,
    $getSelection,
    $isRangeSelection,
    $createParagraphNode,
} from 'lexical';
import { $setBlocksType, $patchStyleText, $getSelectionStyleValueForProperty } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_CHECK_LIST_COMMAND,
} from '@lexical/list';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import {
    Bold, Italic, Underline, Strikethrough, Code, Link as LinkIcon,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Type, Heading1, Heading2, Heading3, Heading4, Quote, List, ListOrdered, Undo, Redo,
    Superscript, Subscript, Eraser, Baseline, PaintBucket, Type as TypeIcon, Video,
    Table as TableIcon, Indent, Outdent, CheckSquare
} from 'lucide-react';
import { TOGGLE_LINK_COMMAND } from '@lexical/link';
import Dropdown from './Dropdown';
import { INSERT_YOUTUBE_COMMAND } from './YouTubePlugin';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import InsertMenu from './InsertMenu';

const BLOCK_TYPES = [
    { label: 'Normal', value: 'paragraph', icon: Type },
    { label: 'Heading 1', value: 'h1', icon: Heading1 },
    { label: 'Heading 2', value: 'h2', icon: Heading2 },
    { label: 'Heading 3', value: 'h3', icon: Heading3 },
    { label: 'Heading 4', value: 'h4', icon: Heading4 },
    { label: 'Quote', value: 'quote', icon: Quote },
];

const FONT_FAMILIES = [
    { label: 'System Default', value: 'system-ui, sans-serif' },
    { label: 'Inter', value: '"Inter", sans-serif' },
    { label: 'Roboto', value: '"Roboto", sans-serif' },
    { label: 'Montserrat', value: '"Montserrat", sans-serif' },
    { label: 'Nunito', value: '"Nunito", sans-serif' },
    { label: 'Serif (Default)', value: 'Georgia, serif' },
    { label: 'Lora', value: '"Lora", serif' },
    { label: 'Merriweather', value: '"Merriweather", serif' },
    { label: 'Playfair Display', value: '"Playfair Display", serif' },
    { label: 'Monospace', value: 'Menlo, Consolas, monospace' },
    { label: 'Fira Code', value: '"Fira Code", monospace' },
    { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
];

const FONT_SIZES = [
    { label: '12px', value: '12px' },
    { label: '14px', value: '14px' },
    { label: '16px', value: '16px' },
    { label: '18px', value: '18px' },
    { label: '20px', value: '20px' },
    { label: '24px', value: '24px' },
    { label: '30px', value: '30px' },
];

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();
    const [blockType, setBlockType] = useState('paragraph');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [isStrikethrough, setIsStrikethrough] = useState(false);
    const [isSubscript, setIsSubscript] = useState(false);
    const [isSuperscript, setIsSuperscript] = useState(false);
    const [isCode, setIsCode] = useState(false);
    const [alignment, setAlignment] = useState('left');

    // Inline Styles State
    const [fontFamily, setFontFamily] = useState('system-ui, sans-serif');
    const [fontSize, setFontSize] = useState('16px');
    const [fontColor, setFontColor] = useState('#2D2A26');
    const [bgColor, setBgColor] = useState('#ffffff');

    const updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            // Update text format
            setIsBold(selection.hasFormat('bold'));
            setIsItalic(selection.hasFormat('italic'));
            setIsUnderline(selection.hasFormat('underline'));
            setIsStrikethrough(selection.hasFormat('strikethrough'));
            setIsSubscript(selection.hasFormat('subscript'));
            setIsSuperscript(selection.hasFormat('superscript'));
            setIsCode(selection.hasFormat('code'));

            // Update inline styles
            setFontFamily($getSelectionStyleValueForProperty(selection, 'font-family', 'system-ui, sans-serif'));
            setFontSize($getSelectionStyleValueForProperty(selection, 'font-size', '16px'));
            setFontColor($getSelectionStyleValueForProperty(selection, 'color', '#2D2A26'));
            setBgColor($getSelectionStyleValueForProperty(selection, 'background-color', '#ffffff'));

            // Safely determine block type (if possible depending on selection depth)
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getKey() === 'root' ? anchorNode : anchorNode.getTopLevelElementOrThrow();
            const elementKey = element.getKey();
            const elementDOM = editor.getElementByKey(elementKey);

            if (elementDOM) {
                // A simplified block type checking since full lexcial nested lookup is complex. Good enough for default use string
                if (element.getType() === 'heading') {
                    setBlockType(element.getTag());
                } else {
                    setBlockType(element.getType());
                }
            }
        }
    }, [editor]);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                updateToolbar();
            });
        });
    }, [editor, updateToolbar]);

    const formatBlock = (type) => {
        if (blockType !== type) {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    if (['h1', 'h2', 'h3', 'h4'].includes(type)) {
                        $setBlocksType(selection, () => $createHeadingNode(type));
                    } else if (type === 'quote') {
                        $setBlocksType(selection, () => $createQuoteNode());
                    } else {
                        $setBlocksType(selection, () => $createParagraphNode());
                    }
                }
            });
        }
    };

    const applyStyleText = useCallback((styles) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                $patchStyleText(selection, styles);
            }
        });
    }, [editor]);

    const blockOptions = BLOCK_TYPES.map(opt => ({
        ...opt,
        onClick: () => formatBlock(opt.value)
    }));

    const fontFamilyOptions = FONT_FAMILIES.map(opt => ({
        ...opt,
        icon: TypeIcon,
        onClick: () => applyStyleText({ 'font-family': opt.value })
    }));

    const fontSizeOptions = FONT_SIZES.map(opt => ({
        ...opt,
        onClick: () => applyStyleText({ 'font-size': opt.value })
    }));

    return (
        <div className="toolbar flex flex-wrap gap-1.5 p-2 bg-surface border-b border-border items-center sticky top-0 z-10 w-full">
            {/* Undo/Redo */}
            <div className="flex bg-surfaceHover/50 rounded-lg p-0.5 border border-border/50">
                <button
                    type="button"
                    onClick={() => { editor.dispatchCommand(UNDO_COMMAND, undefined); }}
                    className="toolbar-item p-1.5 rounded-md hover:bg-surface hover:shadow-sm text-textMuted hover:text-textMain transition-all"
                    title="Undo (Ctrl+Z)"
                >
                    <Undo size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => { editor.dispatchCommand(REDO_COMMAND, undefined); }}
                    className="toolbar-item p-1.5 rounded-md hover:bg-surface hover:shadow-sm text-textMuted hover:text-textMain transition-all"
                    title="Redo (Ctrl+Y)"
                >
                    <Redo size={16} />
                </button>
            </div>

            <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block"></div>

            {/* Block & Font Formats */}
            <InsertMenu />
            <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block"></div>

            <Dropdown title="Block Format" value={blockType} options={blockOptions} />
            <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block"></div>

            <Dropdown title="Font Family" value={fontFamily} options={fontFamilyOptions} />
            <Dropdown title="Font Size" value={fontSize} options={fontSizeOptions} />

            <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block"></div>

            {/* Colors */}
            <div className="relative flex items-center group">
                <Baseline size={18} className="absolute left-2 text-textMain pointer-events-none group-hover:text-primary transition-colors z-10" />
                <input
                    type="color"
                    value={fontColor}
                    onChange={(e) => applyStyleText({ color: e.target.value })}
                    className="w-8 h-8 p-0 border-0 opacity-0 absolute cursor-pointer z-20"
                    title="Text Color"
                />
                <div className="w-8 h-8 rounded border border-border flex items-center justify-center bg-surfaceHover group-hover:bg-primary/10 transition-colors" style={{ borderBottomColor: fontColor, borderBottomWidth: '4px' }}></div>
            </div>

            <div className="relative flex items-center group">
                <PaintBucket size={18} className="absolute left-2 text-textMain pointer-events-none group-hover:text-primary transition-colors z-10" />
                <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => applyStyleText({ 'background-color': e.target.value })}
                    className="w-8 h-8 p-0 border-0 opacity-0 absolute cursor-pointer z-20"
                    title="Background Color"
                />
                <div className="w-8 h-8 rounded border border-border flex items-center justify-center bg-surfaceHover group-hover:bg-primary/10 transition-colors" style={{ borderBottomColor: bgColor, borderBottomWidth: '4px' }}></div>
            </div>

            <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block"></div>

            <button
                type="button"
                onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold'); }}
                className={`toolbar-item p-1.5 rounded ${isBold ? 'bg-primary/20 text-primary' : 'text-textMain hover:bg-surfaceHover'}`}
                title="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                type="button"
                onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic'); }}
                className={`toolbar-item p-1.5 rounded ${isItalic ? 'bg-primary/20 text-primary' : 'text-textMain hover:bg-surfaceHover'}`}
                title="Italic"
            >
                <Italic size={18} />
            </button>
            <button
                type="button"
                onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline'); }}
                className={`toolbar-item p-1.5 rounded ${isUnderline ? 'bg-primary/20 text-primary' : 'text-textMain hover:bg-surfaceHover'}`}
                title="Underline"
            >
                <Underline size={18} />
            </button>
            <button
                type="button"
                onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough'); }}
                className={`toolbar-item p-1.5 rounded ${isStrikethrough ? 'bg-primary/20 text-primary' : 'text-textMain hover:bg-surfaceHover'}`}
                title="Strikethrough"
            >
                <Strikethrough size={18} />
            </button>
            <button
                type="button"
                onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code'); }}
                className={`toolbar-item p-1.5 rounded ${isCode ? 'bg-primary/20 text-primary' : 'text-textMain hover:bg-surfaceHover'}`}
                title="Inline Code"
            >
                <Code size={18} />
            </button>
            <button
                type="button"
                onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'subscript'); }}
                className={`toolbar-item p-1.5 rounded ${isSubscript ? 'bg-primary/20 text-primary' : 'text-textMain hover:bg-surfaceHover'}`}
                title="Subscript"
            >
                <Subscript size={18} />
            </button>
            <button
                type="button"
                onClick={() => { editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'superscript'); }}
                className={`toolbar-item p-1.5 rounded ${isSuperscript ? 'bg-primary/20 text-primary' : 'text-textMain hover:bg-surfaceHover'}`}
                title="Superscript"
            >
                <Superscript size={18} />
            </button>

            <div className="w-[1px] h-6 bg-border mx-1"></div>

            <button
                type="button"
                onClick={() => {
                    const url = prompt('Enter link URL (e.g., https://example.com):');
                    if (url !== null) {
                        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url || null);
                    }
                }}
                className="toolbar-item p-1.5 hover:bg-surfaceHover rounded text-textMain"
                title="Insert Link"
            >
                <LinkIcon size={18} />
            </button>

            <button
                type="button"
                onClick={() => {
                    const url = prompt('Enter Image URL:');
                    if (url) {
                        editor.dispatchCommand(INSERT_IMAGE_COMMAND, url);
                    }
                }}
                className="toolbar-item p-1.5 hover:bg-surfaceHover rounded text-textMain"
                title="Insert Image URL"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
            </button>

            <button
                type="button"
                onClick={() => {
                    const url = prompt('Enter YouTube URL:');
                    if (url) {
                        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                        if (match && match[1]) {
                            editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, match[1]);
                        } else {
                            alert('Invalid YouTube URL');
                        }
                    }
                }}
                className="toolbar-item p-1.5 hover:bg-surfaceHover rounded text-textMain"
                title="Insert Video"
            >
                <Video size={18} />
            </button>

            <button
                type="button"
                onClick={() => {
                    editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' });
                }}
                className="toolbar-item p-1.5 hover:bg-surfaceHover rounded text-textMain"
                title="Insert Table (3x3)"
            >
                <TableIcon size={18} />
            </button>

            <div className="w-[1px] h-6 bg-border mx-1"></div>

            <button
                type="button"
                onClick={() => { editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined); }}
                className="toolbar-item p-1.5 hover:bg-surfaceHover rounded text-textMain"
                title="Bullet List"
            >
                <List size={18} />
            </button>
            <button
                type="button"
                onClick={() => { editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined); }}
                className="toolbar-item p-1.5 hover:bg-surfaceHover rounded text-textMain"
                title="Numbered List"
            >
                <ListOrdered size={18} />
            </button>

            <button
                type="button"
                onClick={() => { editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined); }}
                className="toolbar-item p-1.5 hover:bg-surfaceHover rounded text-textMain"
                title="Check List"
            >
                <CheckSquare size={18} />
            </button>

            <div className="w-[1px] h-6 bg-border mx-1"></div>

            <button
                type="button"
                onClick={() => { editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined); }}
                className="toolbar-item p-1.5 hover:bg-surfaceHover rounded text-textMain"
                title="Outdent"
            >
                <Outdent size={18} />
            </button>
            <button
                type="button"
                onClick={() => { editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined); }}
                className="toolbar-item p-1.5 hover:bg-surfaceHover rounded text-textMain"
                title="Indent"
            >
                <Indent size={18} />
            </button>

            <div className="w-[1px] h-6 bg-border mx-1"></div>

            <button type="button" onClick={() => { editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left'); setAlignment('left') }} className={`toolbar-item p-1.5 hover:bg-surfaceHover rounded ${alignment === 'left' ? 'bg-primary/20 text-primary' : 'text-textMain'}`} title="Align Left"><AlignLeft size={18} /></button>
            <button type="button" onClick={() => { editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center'); setAlignment('center') }} className={`toolbar-item p-1.5 hover:bg-surfaceHover rounded ${alignment === 'center' ? 'bg-primary/20 text-primary' : 'text-textMain'}`} title="Align Center"><AlignCenter size={18} /></button>
            <button type="button" onClick={() => { editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right'); setAlignment('right') }} className={`toolbar-item p-1.5 hover:bg-surfaceHover rounded ${alignment === 'right' ? 'bg-primary/20 text-primary' : 'text-textMain'}`} title="Align Right"><AlignRight size={18} /></button>
            <button type="button" onClick={() => { editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify'); setAlignment('justify') }} className={`toolbar-item p-1.5 hover:bg-surfaceHover rounded ${alignment === 'justify' ? 'bg-primary/20 text-primary' : 'text-textMain'}`} title="Justify"><AlignJustify size={18} /></button>

            <div className="w-[1px] h-6 bg-border mx-1 hidden sm:block"></div>

            <button
                type="button"
                onClick={() => { editor.dispatchCommand(UNDO_COMMAND, undefined); }}
                className="toolbar-item p-1.5 hover:bg-surfaceHover rounded text-textMuted ml-auto sm:ml-0"
                title="Undo"
            >
                <Undo size={18} />
            </button>
            <button
                type="button"
                onClick={() => { editor.dispatchCommand(REDO_COMMAND, undefined); }}
                className="toolbar-item p-1.5 hover:bg-surfaceHover rounded text-textMuted"
                title="Redo"
            >
                <Redo size={18} />
            </button>
            <div className="w-[1px] h-6 bg-border mx-1"></div>
            <button
                type="button"
                onClick={() => {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            // Extract nodes and reset block type to paragraph
                            $setBlocksType(selection, () => $createParagraphNode());

                            // Remove all text formats
                            const nodes = selection.getNodes();
                            nodes.forEach(node => {
                                if (node.setFormat) {
                                    node.setFormat(0);
                                }
                            });
                        }
                    });
                }}
                className="toolbar-item p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded text-textMuted transition-colors"
                title="Clear Formatting"
            >
                <Eraser size={18} />
            </button>
        </div>
    );
}

