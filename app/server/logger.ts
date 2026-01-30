/**
 * Centralized Logger Utility
 * Encapsulates logging logic and environment checks.
 */
type Loggable = string | number | boolean | null | undefined | object | Error;

export const Logger = {
    info: (...args: Loggable[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.log(...args);
        }
    },
    warn: (...args: Loggable[]) => {
        console.warn(...args);
    },
    error: (...args: Loggable[]) => {
        console.error(...args);
    },
};
