import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes, createCommand } from 'lexical';
import { useEffect } from 'react';
import { $createImageNode, ImageNode } from './nodes/ImageNode';

export const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND');

export default function ImagePlugin() {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('Editor: Image component not registered');
        }

        return editor.registerCommand(
            INSERT_IMAGE_COMMAND,
            (payload) => {
                const imageNode = $createImageNode(payload);
                $insertNodes([imageNode]);
                return true;
            },
            0,
        );
    }, [editor]);

    return null;
}
