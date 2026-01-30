import { formatError, logError } from '@/utils/error-utils';

export interface TranslationParams {
    text: string;
    source?: string;
    target?: string;
}

export interface TranslationResponse {
    translatedText?: string;
    match?: number;
    error?: string;
}

export const TranslationService = {
    async translate({
        text,
        source = 'es',
        target = 'en-GB',
    }: TranslationParams): Promise<TranslationResponse> {
        try {
            const res = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, source, target }),
            });

            if (!res.ok) {
                const errorBody = await res.text().catch(() => 'Unknown error');
                const errorMsg = `Translation failed (${res.status}): ${errorBody}`;
                logError('TranslationService', errorMsg);
                return { error: errorMsg };
            }

            return await res.json();
        } catch (error) {
            logError('TranslationService', error);
            return {
                error: formatError(error).message,
            };
        }
    },
};
