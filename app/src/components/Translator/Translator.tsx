import { useState, useActionState } from 'react';
import { Languages, X, ArrowRight, Loader2, Copy, Check } from 'lucide-react';
import { TranslationService } from '@/services/translation.service';
import './Translator-style.css';

interface TranslationState {
    result: string;
    error: string | null;
}

export function Translator() {
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState(''); // Live fix: Enter key behavior
    const [copied, setCopied] = useState(false);

    // Initial state for the translation action
    const initialState: TranslationState = { result: '', error: null };

    const [state, dispatchTranslate, isPending] = useActionState(
        async (
            _previousState: TranslationState,
            textToTranslate: string
        ): Promise<TranslationState> => {
            if (!textToTranslate.trim()) return initialState;

            const data = await TranslationService.translate({
                text: textToTranslate,
                source: 'es',
                target: 'en-GB',
            });

            return {
                result: data.translatedText || '',
                error: data.error || null,
            };
        },
        initialState
    );

    const handleTranslate = () => {
        dispatchTranslate(text);
    };

    const result = state.result || state.error;

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Toggle scroll lock on body when open on mobile (optional, skipped for now to keep it simple)

    return (
        <div className="translator-widget">
            {isOpen && (
                <div
                    className="translator-panel"
                    data-testid="translator-panel"
                >
                    <div className="translator-header">
                        <div className="translator-title">
                            <Languages size={16} className="text-blue-400" />
                            <span>Quick Translator</span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-white transition-colors"
                            data-testid="close-translator"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    <textarea
                        className="translator-textarea"
                        placeholder="Escribe en español..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                            // Ctrl+Enter or Cmd+Enter to translate
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleTranslate();
                            }
                        }}
                    />

                    <div className="translator-actions">
                        <button
                            className="translate-btn"
                            onClick={handleTranslate}
                            disabled={isPending || !text.trim()}
                        >
                            {isPending ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <>
                                    Translate <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </div>

                    {result && (
                        <div
                            className={`translation-result group cursor-pointer ${state.error ? 'border-red-500/50 bg-red-500/5' : ''}`}
                            onClick={handleCopy}
                        >
                            <span
                                className={`result-label ${state.error ? 'text-red-400' : ''}`}
                            >
                                {state.error ? 'Error' : 'English'}
                            </span>
                            <p
                                className={`result-text ${state.error ? 'text-red-200' : ''}`}
                            >
                                {result}
                            </p>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {copied ? (
                                    <Check
                                        size={14}
                                        className="text-green-400"
                                    />
                                ) : (
                                    <Copy
                                        size={14}
                                        className="text-slate-400"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button
                className="translator-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Translator"
            >
                {isOpen ? <X size={24} /> : <Languages size={24} />}
            </button>
        </div>
    );
}
