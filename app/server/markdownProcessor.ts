import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export function processMarkdown(content: string): string {
    // Strip YAML frontmatter
    const contentWithoutFrontmatter = content.replace(
        /^[\s\r\n]*---\s*\n[\s\S]*?\n---\s*\n?/,
        ''
    );

    // Pre-process content to replace file:// URIs with relative paths
    let processedContent = contentWithoutFrontmatter.replace(
        /file:\/\/\/Volumes\/externo1tb\/proyectos\/ingles\/(contenido\/)?/g,
        '/'
    );

    // Personalization: Replace placeholders with Environment Variables
    processedContent = processedContent.replace(
        /\[Name\]/gi,
        process.env.USER_NAME || 'USER'
    );
    processedContent = processedContent.replace(
        /\[Age\]/gi,
        process.env.USER_AGE || 'UNKNOWN'
    );
    processedContent = processedContent.replace(
        /\[City\]/gi,
        process.env.USER_CITY || 'UNKNOWN'
    );

    // Configure marked options
    marked.setOptions({
        gfm: true,
        breaks: true,
    });

    // Parse markdown to HTML
    let rawHtml = marked.parse(processedContent) as string;

    // Post-process: Convert YouTube links to embedded iframes
    rawHtml = rawHtml.replace(
        /<a href="(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)[^"]*)"[^>]*>([^<]+)<\/a>/g,
        (_match, _url, videoId, text) => {
            return `
                <div class="video-item" data-testid="youtube-video">
                    <div class="video-container">
                        <iframe
                            src="https://www.youtube.com/embed/${videoId}?playsinline=1"
                            title="${text}"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowfullscreen
                            playsinline
                        ></iframe>
                    </div>
                    <div class="p-3">
                        <p class="text-sm font-semibold m-0" style="color: #f8fafc">${text}</p>
                    </div>
                </div>
            `;
        }
    );

    // Post-process: Add video-grid class to lists containing YouTube videos
    rawHtml = rawHtml.replace(/<ul>([\s\S]*?)<\/ul>/g, (match, content) => {
        if (
            content.includes('youtube.com/embed') ||
            content.includes('video-item')
        ) {
            return `<ul class="video-grid">${content}</ul>`;
        }
        return match;
    });

    // Post-process: Add video-card class to list items containing videos
    rawHtml = rawHtml.replace(/<li>([\s\S]*?)<\/li>/g, (match, content) => {
        if (content.includes('video-item')) {
            return `<li class="video-card">${content}</li>`;
        }
        return match;
    });

    // Post-process: Convert internal links to use query params
    rawHtml = rawHtml.replace(
        /<a href="(\/[^"]+\.md)"([^>]*)>/g,
        (_match, href, attrs) => {
            // Encode path segments individually to preserve forward slashes
            const path = href.slice(1);
            const encodedPath = path
                .split('/')
                .map((segment: string) => encodeURIComponent(segment))
                .join('/');
            return `<a href="?path=${encodedPath}"${attrs}>`;
        }
    );

    // Post-process: Add text-to-speech triggers for questions and answers
    rawHtml = rawHtml.replace(
        /<strong>(Question|Answer):<\/strong>\s*(.*?)(?=<ul>|<\/li>|<\/p>|<br>|$)/g,
        (_match, label, text) => {
            const cleanText = text.trim();
            // Wrap both text and icon in a single interactive container
            return `<strong>${label}:</strong> <span class="tts-wrapper" role="button" tabindex="0" data-text="${cleanText}" aria-label="Play audio for: ${cleanText}">${cleanText} <span class="tts-icon">🔊</span></span>`;
        }
    );

    // Post-process: Add TTS for direct expressions list (e.g. - **"Hello"** - Hola)
    // Matches: <li><strong>"English Text"</strong> - Translation</li>
    // Note: marked encodes quotes as &quot;
    rawHtml = rawHtml.replace(
        /(<li>\s*)<strong>&quot;(.*?)&quot;<\/strong>/g,
        (_match, prefix, text) => {
            const cleanText = text.trim();
            // We keep the visual quotes inside the strong tag for style, but the data-text should be clean
            // Since we matched inside &quot;...&quot;, the text itself is likely clean or has inner entities.
            // We render the visual quotes as part of the bold text.
            return `${prefix}<span class="tts-wrapper" role="button" tabindex="0" data-text="${cleanText}" aria-label="Play audio for: ${cleanText}"><strong>"${cleanText}"</strong> <span class="tts-icon">🔊</span></span>`;
        }
    );

    // Sanitize HTML to prevent XSS (allow iframe for YouTube)
    const cleanHtml = sanitizeHtml(rawHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            'img',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'iframe',
            'div',
            'input',
            'span',
            'button', // Allow button for TTS
        ]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'title'],
            a: ['href', 'title', 'target', 'rel'],
            iframe: [
                'src',
                'title',
                'allow',
                'allowfullscreen',
                'playsinline',
                'width',
                'height',
                'frameborder',
            ],
            div: ['class', 'data-testid'],
            p: ['class', 'style'],
            ul: ['class'],
            li: ['class'],
            input: ['type', 'checked', 'disabled'],
            span: ['class', 'data-text', 'title'],
            button: ['class', 'data-text', 'aria-label'], // Allow attributes for TTS button
        },
        allowedClasses: {
            div: ['video-item', 'video-container', 'p-3'],
            p: ['text-sm', 'font-semibold', 'm-0'],
            ul: ['video-grid'],
            li: ['video-card'],
            button: ['tts-trigger'],
        },
    });

    return cleanHtml;
}
