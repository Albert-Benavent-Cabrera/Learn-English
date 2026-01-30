export {};

declare global {
    interface Window {
        requestIdleCallback: (
            callback: (deadline: IdleDeadline) => void,
            options?: IdleRequestOptions
        ) => number;
        cancelIdleCallback: (handle: number) => void;
    }

    interface IdleDeadline {
        timeRemaining: () => number;
        readonly didTimeout: boolean;
    }

    interface IdleRequestOptions {
        timeout?: number;
    }
}
