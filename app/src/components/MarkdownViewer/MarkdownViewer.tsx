import { useState, useEffect } from 'react';
import { logError } from '@/utils/error-utils';
import './MarkdownViewer-style.css';

interface IMarkdownViewerProps {
    content: string;
    metadata?: Record<
        string,
        string | number | boolean | null | undefined | string[]
    >;
}

export function MarkdownViewer({ content, metadata }: IMarkdownViewerProps) {
    const [preferredVoice, setPreferredVoice] =
        useState<SpeechSynthesisVoice | null>(null);

    // Preload voices to avoid race conditions
    useEffect(() => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        const loadVoices = () => {
            try {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    const voice =
                        voices.find((v) =>
                            v.name.includes('Google US English')
                        ) ||
                        voices.find((v) => v.name.includes('Samantha')) ||
                        voices.find((v) => v.lang === 'en-US');

                    if (voice) {
                        setPreferredVoice(voice);
                    }
                }
            } catch (error) {
                logError('SpeechSynthesis', error);
            }
        };

        loadVoices();

        // Chrome/Safari load voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = null;
            }
        };
    }, []);

    const handleContentClick = (e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        const trigger = target.closest('.tts-wrapper');

        if (trigger) {
            e.preventDefault();
            e.stopPropagation();

            const text = trigger.getAttribute('data-text');
            if (text) {
                // Cancel previous speech directly
                if (window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                }

                // Cleanup: Remove 'speaking' class from any currently active text
                const allTexts = document.querySelectorAll('.tts-wrapper');
                allTexts.forEach((el) => el.classList.remove('speaking'));

                if (!window.speechSynthesis) return;

                const utterance = new SpeechSynthesisUtterance(text);

                // Use preloaded voice
                if (preferredVoice) {
                    utterance.voice = preferredVoice;
                }

                utterance.lang = 'en-US';
                utterance.rate = 1.0;
                utterance.pitch = 1.0;

                // Highlight logic (wrapper itself)
                trigger.classList.add('speaking');
                utterance.onend = () => {
                    trigger.classList.remove('speaking');
                };
                // Handle cancellation or error
                utterance.onerror = () => {
                    trigger.classList.remove('speaking');
                };

                window.speechSynthesis.speak(utterance);
            }
        }
    };

    return (
        <article className="markdown-viewer" data-testid="markdown-viewer">
            {typeof metadata?.level === 'string' && (
                <div className="mb-6">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        Level: {metadata.level}
                    </span>
                </div>
            )}
            <div
                dangerouslySetInnerHTML={{ __html: content }}
                onClick={handleContentClick}
            />
        </article>
    );
}
