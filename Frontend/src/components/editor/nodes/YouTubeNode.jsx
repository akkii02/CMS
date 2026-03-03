import { DecoratorNode } from 'lexical';

export class YouTubeNode extends DecoratorNode {
    __id;

    static getType() {
        return 'youtube';
    }

    static clone(node) {
        return new YouTubeNode(node.__id, node.__key);
    }

    static importJSON(serializedNode) {
        const node = $createYouTubeNode(serializedNode.videoID);
        return node;
    }

    static importDOM() {
        return {
            iframe: (node) => ({
                conversion: (element) => {
                    const src = element.getAttribute('src');
                    if (src && src.includes('youtube')) {
                        const match = src.match(/embed\/([^?]+)/);
                        if (match && match[1]) {
                            return { node: $createYouTubeNode(match[1]) };
                        }
                    }
                    return null;
                },
                priority: 1,
            }),
            div: (node) => ({
                conversion: (element) => {
                    if (element.className.includes('youtube-embed')) {
                        const iframe = element.querySelector('iframe');
                        if (iframe) {
                            const src = iframe.getAttribute('src');
                            if (src && src.includes('youtube')) {
                                const match = src.match(/embed\/([^?]+)/);
                                if (match && match[1]) {
                                    return { node: $createYouTubeNode(match[1]) };
                                }
                            }
                        }
                    }
                    return null;
                },
                priority: 1,
            }),
        };
    }

    exportJSON() {
        return {
            type: 'youtube',
            version: 1,
            videoID: this.__id,
        };
    }

    constructor(id, key) {
        super(key);
        this.__id = id;
    }

    exportDOM() {
        const element = document.createElement('div');
        element.setAttribute('class', 'youtube-embed');
        element.setAttribute('style', 'position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; background: #000; border-radius: 16px; margin: 2rem 0;');
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${this.__id}`);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('style', 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;');
        element.appendChild(iframe);
        return { element };
    }

    updateDOM() {
        return false;
    }

    isInline() {
        return false;
    }

    createDOM(config) {
        const wrapper = document.createElement('div');
        wrapper.className = 'editor-youtube-wrapper my-6 relative w-full pb-[56.25%] overflow-hidden rounded-2xl border border-border bg-surfaceHover/50';
        return wrapper;
    }

    decorate() {
        return (
            <div className="relative w-full pb-[56.25%] overflow-hidden rounded-2xl block my-4" contentEditable={false}>
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${this.__id}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen={true}
                    title="YouTube video"
                />
            </div>
        );
    }
}

export function $createYouTubeNode(videoID) {
    return new YouTubeNode(videoID);
}

export function $isYouTubeNode(node) {
    return node instanceof YouTubeNode;
}
