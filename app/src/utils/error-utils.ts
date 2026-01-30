/**
 * Formats an unknown error into a structured object.
 */
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export function formatError(error: unknown): {
    message: string;
    stack?: string;
} {
    if (error instanceof Error) {
        return {
            message: error.message,
            stack: error.stack,
        };
    }

    if (typeof error === 'string') {
        return { message: error };
    }

    try {
        return { message: JSON.stringify(error) };
    } catch {
        return { message: String(error) };
    }
}

/**
 * Convenience logger for standardized error output.
 */
// eslint-disable-next-line @typescript-eslint/no-restricted-types
export function logError(context: string, error: unknown) {
    const formatted = formatError(error);
    console.error(
        `[${context}] Error:`,
        formatted.message,
        formatted.stack || ''
    );
}
