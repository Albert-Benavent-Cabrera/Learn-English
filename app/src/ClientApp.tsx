import { useState, useEffect, useRef, useTransition, Suspense } from 'react';
import { SidebarWrapper } from '@/components/Sidebar/SidebarWrapper';
import { MarkdownDisplay } from '@/components/MarkdownViewer/MarkdownDisplay';
import { Translator } from '@/components/Translator/Translator';
import { IFileNode } from '../server/models/IFileNode';
import { ContentService } from '@/services/content.service';

export interface IClientAppProps {
    path: string;
    tree: IFileNode[];
    content: string | null;
    metadata?: Record<
        string,
        string | number | boolean | null | undefined | string[]
    >;
}

export function ClientApp(props: IClientAppProps) {
    const { path: initialPath, tree } = props;
    const [currentPath, setCurrentPath] = useState(initialPath);
    const [isPending, startTransition] = useTransition();

    // Directly get promise. React Compiler handles efficiency.
    const contentPromise = ContentService.getContent(currentPath);

    const mainRef = useRef<HTMLElement>(null);

    // Navigation helper with scroll-to-top
    const applyNavigation = (path: string, shouldPushState = true) => {
        if (shouldPushState) {
            window.history.pushState({ path }, '', `?path=${path}`);
        }

        startTransition(() => {
            setCurrentPath(path);
            // Imperative scroll to top on navigation
            window.scrollTo({ top: 0, behavior: 'instant' });
            if (mainRef.current) mainRef.current.scrollTop = 0;
        });
    };

    const handleNavigate = (path: string) => {
        if (path === currentPath) return;
        applyNavigation(path);
    };

    const handleRetry = () => {
        // Clear cache for current path and force re-fetch
        ContentService.setCache(currentPath, null);
        // Or just reload as a safe fallback
        window.location.reload();
    };

    useEffect(() => {
        // 1. Handle Back/Forward buttons
        const handlePopState = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const path = urlParams.get('path') || 'README.md';
            applyNavigation(path, false);
        };

        // 2. Initial Prefetching
        const prefetch = () => ContentService.prefetchAll(tree);
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(prefetch, { timeout: 5000 });
        } else {
            setTimeout(prefetch, 2000);
        }

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [tree]); // tree is stable, this runs mostly on mount

    return (
        <div
            className="flex flex-col md:flex-row min-h-screen"
            style={{ color: 'var(--foreground)', background: '#020617' }}
        >
            <SidebarWrapper
                tree={tree}
                currentPath={currentPath}
                onNavigate={handleNavigate}
            />
            <main
                ref={mainRef}
                className="flex-1 px-2 pb-4 pt-16 md:pt-8 md:p-12 lg:p-16 overflow-y-auto md:ml-[18rem]"
            >
                <div
                    className={`max-w-4xl mx-auto glass-effect transition-opacity duration-200 ${isPending ? 'opacity-50' : 'opacity-100'}`}
                >
                    <Suspense
                        fallback={
                            <div className="p-8 text-slate-500 text-center animate-pulse">
                                Loading content...
                            </div>
                        }
                    >
                        <MarkdownDisplay
                            contentPromise={contentPromise}
                            onRetry={handleRetry}
                        />
                    </Suspense>
                </div>
            </main>
            <Translator />
        </div>
    );
}
