import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_EDITOR, createCommand } from 'lexical';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { $createYouTubeNode, YouTubeNode } from './nodes/YouTubeNode';

export const INSERT_YOUTUBE_COMMAND = createCommand('INSERT_YOUTUBE_COMMAND');

export default function YouTubePlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([YouTubeNode])) {
            throw new Error('Editor: Video component not registered');
        }

        return editor.registerCommand(
            INSERT_YOUTUBE_COMMAND,
            (payload) => {
                const youtubeNode = $createYouTubeNode(payload);
                $insertNodeToNearestRoot(youtubeNode);
                return true;
            },
            COMMAND_PRIORITY_EDITOR,
        );
    }, [editor]);

    return null;
}
