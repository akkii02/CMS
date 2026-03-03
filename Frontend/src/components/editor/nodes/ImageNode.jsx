import { DecoratorNode } from 'lexical';

export class ImageNode extends DecoratorNode {
    __src;
    __altText;

    static getType() {
        return 'image';
    }

    static clone(node) {
        return new ImageNode(node.__src, node.__altText, node.__key);
    }

    static importJSON(serializedNode) {
        return $createImageNode(serializedNode.src, serializedNode.altText);
    }

    static importDOM() {
        return {
            img: (node) => ({
                conversion: (element) => {
                    const src = element.getAttribute('src');
                    const altText = element.getAttribute('alt');
                    if (src) {
                        return { node: $createImageNode(src, altText) };
                    }
                    return null;
                },
                priority: 1,
            }),
        };
    }

    exportJSON() {
        return {
            type: 'image',
            version: 1,
            src: this.__src,
            altText: this.__altText,
        };
    }

    constructor(src, altText, key) {
        super(key);
        this.__src = src;
        this.__altText = altText;
    }

    exportDOM() {
        const element = document.createElement('img');
        element.setAttribute('src', this.__src);
        element.setAttribute('alt', this.__altText);
        element.setAttribute('style', 'max-width: 100%; height: auto; border-radius: 16px; margin: 2rem 0; display: block;');
        return { element };
    }

    updateDOM() {
        return false;
    }

    isInline() {
        return false;
    }

    createDOM(config) {
        const span = document.createElement('span');
        span.className = 'editor-image-wrapper block my-6 w-full flex justify-center';
        return span;
    }

    decorate() {
        return (
            <div className="relative group max-w-full block my-4" contentEditable={false}>
                <img
                    src={this.__src}
                    alt={this.__altText}
                    className="rounded-2xl border border-white/10 shadow-2xl max-w-full h-auto"
                />
            </div>
        );
    }
}

export function $createImageNode(src, altText = 'Blog Image') {
    return new ImageNode(src, altText);
}

export function $isImageNode(node) {
    return node instanceof ImageNode;
}
