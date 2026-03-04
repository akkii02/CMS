import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalTypeaheadMenuPlugin, MenuOption, useBasicTypeaheadTriggerMatch } from '@lexical/react/LexicalTypeaheadMenuPlugin';
import { $createTextNode, $getSelection, $isRangeSelection, TextNode } from 'lexical';
import { User } from 'lucide-react';

const mockUsers = [
    { id: '1', name: 'Alex Developer', handle: 'alexdev' },
    { id: '2', name: 'Sam Writer', handle: 'samwriter' },
    { id: '3', name: 'Priya Publisher', handle: 'priyapro' },
    { id: '4', name: 'Guest Blogger', handle: 'guest' },
    { id: '5', name: 'Admin Account', handle: 'admin' },
];

class MentionOption extends MenuOption {
    constructor(name, handle, picture) {
        super(name);
        this.name = name;
        this.handle = handle;
        this.picture = picture;
    }
}

export default function MentionsPlugin() {
    const [editor] = useLexicalComposerContext();
    const [queryString, setQueryString] = useState(null);

    const matchTrigger = useBasicTypeaheadTriggerMatch('@', { minLength: 0 });

    const options = useMemo(() => {
        const query = queryString?.toLowerCase() || '';
        return mockUsers
            .filter((user) => user.name.toLowerCase().includes(query) || user.handle.toLowerCase().includes(query))
            .map((user) => new MentionOption(user.name, user.handle, null));
    }, [queryString]);

    const onSelectOption = useCallback(
        (selectedOption, nodeToReplace, closeMenu) => {
            editor.update(() => {
                const mentionText = `@${selectedOption.handle}`;
                const textNode = $createTextNode(mentionText).toggleFormat('code'); // using code format for distinction for now

                if (nodeToReplace) {
                    nodeToReplace.replace(textNode);
                }
                const spaceNode = $createTextNode(' ');
                textNode.insertAfter(spaceNode);
                spaceNode.select();
                closeMenu();
            });
        },
        [editor]
    );

    return (
        <LexicalTypeaheadMenuPlugin
            onQueryChange={setQueryString}
            onSelectOption={onSelectOption}
            triggerFn={matchTrigger}
            options={options}
            menuRenderFn={(anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex }) => {
                if (!anchorElementRef.current || options.length === 0) return null;

                return (
                    <div
                        className="absolute bg-surface shadow-2xl rounded-xl border border-border/50 py-2 w-64 z-[99999] overflow-hidden animate-fade-in"
                        style={{
                            top: anchorElementRef.current.offsetTop - 5,
                            left: anchorElementRef.current.offsetLeft + 10,
                        }}
                    >
                        <div className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-textMuted/70 border-b border-border/30">Select User</div>
                        <ul className="max-h-60 overflow-y-auto">
                            {options.map((option, idx) => (
                                <li
                                    key={option.key}
                                    tabIndex={-1}
                                    ref={option.setRefElement}
                                    role="option"
                                    aria-selected={selectedIndex === idx}
                                    onMouseEnter={() => setHighlightedIndex(idx)}
                                    onClick={() => selectOptionAndCleanUp(option)}
                                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${selectedIndex === idx ? 'bg-primary/10 text-primary' : 'text-textMain hover:bg-surfaceHover'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border shadow-sm ${selectedIndex === idx ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-surface border-border text-textMuted'}`}>
                                        <User size={16} />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                        <span className="text-sm font-bold leading-tight truncate">{option.name}</span>
                                        <span className={`text-[11px] font-medium leading-tight truncate ${selectedIndex === idx ? 'text-primary' : 'text-textMuted'}`}>@{option.handle}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                );
            }}
        />
    );
}
