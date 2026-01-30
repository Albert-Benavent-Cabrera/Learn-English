import { use } from 'react';
import { MarkdownViewer } from './MarkdownViewer';
import { ContentResponse } from '@/services/content.service';

interface MarkdownDisplayProps {
    contentPromise: Promise<ContentResponse>;
    onRetry?: () => void;
}

export function MarkdownDisplay({
    contentPromise,
    onRetry,
}: MarkdownDisplayProps) {
    // Unwrapping the promise with React 19 use()
    const data = use(contentPromise);

    // Handling "Error as Data" pattern with inlined UI
    if (data.error) {
        return (
            <div className="p-12 text-center bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-400 mb-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                        <path d="M12 9v4" />
                        <path d="M12 17h.01" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                    Something went wrong
                </h2>
                <p className="text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">
                    {data.error}
                </p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    >
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    if (!data.content) {
        return (
            <div className="p-8 text-slate-500 text-center">
                <h1 className="text-3xl font-bold mb-4">404</h1>
                <p>Content not found.</p>
            </div>
        );
    }

    return (
        <MarkdownViewer content={data.content} metadata={data.metadata || {}} />
    );
}
