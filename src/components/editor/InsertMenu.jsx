import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback, useState } from 'react';
import { INSERT_TABLE_COMMAND } from '@lexical/table';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import { INSERT_YOUTUBE_COMMAND } from './YouTubePlugin';
import { INSERT_IMAGE_COMMAND } from './ImagePlugin';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND } from 'lexical';
import { ChevronDown, Plus, Table, Minus, Code, Video, Image as ImageIcon } from 'lucide-react';

export default function InsertMenu() {
    const [editor] = useLexicalComposerContext();
    const [isOpen, setIsOpen] = useState(false);

    const handleAction = useCallback(
        (action) => {
            switch (action) {
                case 'table':
                    editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' });
                    break;
                case 'rule':
                    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
                    break;
                case 'code':
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
                    break;
                case 'youtube':
                    const ytUrl = prompt('Enter YouTube URL:');
                    if (ytUrl) {
                        const match = ytUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
                        if (match && match[1]) {
                            editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, match[1]);
                        } else {
                            alert('Invalid YouTube URL');
                        }
                    }
                    break;
                case 'image':
                    const imgUrl = prompt('Enter Image URL:');
                    if (imgUrl) {
                        editor.dispatchCommand(INSERT_IMAGE_COMMAND, imgUrl);
                    }
                    break;
                default:
                    break;
            }
            setIsOpen(false);
        },
        [editor]
    );

    return (
        <div className="relative inline-block text-left toolbar-item-container">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 p-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-semibold transition-all shadow-sm"
                title="Insert Block"
            >
                <Plus size={16} />
                <span className="hidden sm:inline">Insert</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 mt-2 w-56 rounded-xl bg-surface border border-border/50 shadow-xl z-50 py-2 animate-fade-in flex flex-col overflow-hidden">
                        <button
                            onClick={() => handleAction('rule')}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-textMain hover:bg-surfaceHover transition-colors"
                        >
                            <Minus size={16} className="text-textMuted" />
                            <span>Horizontal Rule</span>
                        </button>
                        <button
                            onClick={() => handleAction('image')}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-textMain hover:bg-surfaceHover transition-colors"
                        >
                            <ImageIcon size={16} className="text-textMuted" />
                            <span>Image</span>
                        </button>
                        <button
                            onClick={() => handleAction('table')}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-textMain hover:bg-surfaceHover transition-colors"
                        >
                            <Table size={16} className="text-textMuted" />
                            <span>Table</span>
                        </button>
                        <button
                            onClick={() => handleAction('code')}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-textMain hover:bg-surfaceHover transition-colors"
                        >
                            <Code size={16} className="text-textMuted" />
                            <span>Code Block</span>
                        </button>
                        <button
                            onClick={() => handleAction('youtube')}
                            className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-textMain hover:bg-surfaceHover transition-colors"
                        >
                            <Video size={16} className="text-textMuted" />
                            <span>YouTube Video</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
