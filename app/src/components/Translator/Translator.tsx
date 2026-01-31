import { useState, useActionState } from 'react';
import {
    Languages,
    X,
    ArrowRight,
    Loader2,
    Copy,
    Check,
    ArrowLeftRight,
} from 'lucide-react';
import { TranslationService } from '@/services/translation.service';
import './Translator-style.css';

interface TranslationState {
    result: string;
    error: string | null;
}

type TranslationDirection = 'es-en' | 'en-es';

export function Translator() {
    const [isOpen, setIsOpen] = useState(false);
    const [text, setText] = useState('');
    const [copied, setCopied] = useState(false);
    const [direction, setDirection] = useState<TranslationDirection>('es-en');

    // Initial state for the translation action
    const initialState: TranslationState = { result: '', error: null };

    const [state, dispatchTranslate, isPending] = useActionState(
        async (
            _previousState: TranslationState,
            payload: { text: string; dir: TranslationDirection }
        ): Promise<TranslationState> => {
            const { text: textToTranslate, dir } = payload;
            if (!textToTranslate.trim()) return initialState;

            const source = dir === 'es-en' ? 'es' : 'en';
            const target = dir === 'es-en' ? 'en-GB' : 'es';

            const data = await TranslationService.translate({
                text: textToTranslate,
                source,
                target,
            });

            return {
                result: data.translatedText || '',
                error: data.error || null,
            };
        },
        initialState
    );

    const handleTranslate = () => {
        dispatchTranslate({ text, dir: direction });
    };

    const toggleDirection = () => {
        setDirection((prev) => (prev === 'es-en' ? 'en-es' : 'es-en'));
        // Optionally clear text or results when direction changes
    };

    const result = state.result || state.error;

    const handleCopy = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleDirection}
                                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                                title="Cambiar dirección"
                            >
                                {direction === 'es-en' ? (
                                    <>
                                        ES 🇪🇸 <ArrowLeftRight size={10} /> EN 🇬🇧
                                    </>
                                ) : (
                                    <>
                                        EN 🇬🇧 <ArrowLeftRight size={10} /> ES 🇪🇸
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors p-1"
                                data-testid="close-translator"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <textarea
                        className="translator-textarea"
                        placeholder={
                            direction === 'es-en'
                                ? 'Escribe en español...'
                                : 'Write in English...'
                        }
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
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
                                    {direction === 'es-en'
                                        ? 'Traducir'
                                        : 'Translate'}{' '}
                                    <ArrowRight size={14} />
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
                                {state.error
                                    ? 'Error'
                                    : direction === 'es-en'
                                      ? 'English'
                                      : 'Español'}
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
