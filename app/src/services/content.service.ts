import { IFileNode } from '../../server/models/IFileNode';
import { formatError } from '@/utils/error-utils';

export interface ContentResponse {
    content: string | null;
    metadata?: Record<
        string,
        string | number | boolean | null | undefined | string[]
    >;
    error?: string;
}

// Simple in-memory cache
const cache = new Map<string, Promise<ContentResponse>>();

export const ContentService = {
    // Manually seed or clear the cache (e.g., during SSR or hydration)
    setCache(path: string, data: ContentResponse | null) {
        if (data === null) {
            cache.delete(path);
        } else {
            cache.set(path, Promise.resolve(data));
        }
    },

    async getContent(path: string): Promise<ContentResponse> {
        // Check cache first
        if (cache.has(path)) {
            return cache.get(path)!;
        }

        // Create promise for the fetch
        const promise = (async (): Promise<ContentResponse> => {
            try {
                const url = `/api/content?path=${encodeURIComponent(path)}`;
                const res = await fetch(url);
                if (!res.ok) {
                    const errorText = await res
                        .text()
                        .catch(() => 'Unknown error');
                    return {
                        content: null,
                        error: `Failed to fetch content (${res.status}): ${errorText}`,
                    };
                }
                return await res.json();
            } catch (err) {
                return {
                    content: null,
                    error: formatError(err).message,
                };
            }
        })();

        // Store promise in cache
        cache.set(path, promise);

        return promise;
    },

    // Recursively prefetch all files in the tree
    prefetchAll(tree: IFileNode[]) {
        for (const node of tree) {
            if (node.type === 'file') {
                // If not in cache, trigger the fetch to seed it.
                // We don't await because we want to trigger all parallelly.
                // Errors are handled internally by getContent (returns error as data).
                if (!cache.has(node.path)) {
                    this.getContent(node.path);
                }
            } else if (node.children) {
                this.prefetchAll(node.children);
            }
        }
    },
};
