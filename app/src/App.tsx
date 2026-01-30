import { Suspense } from 'react';
import { getAppFileTree, getFileContent } from '../server/fileTree';
import { processMarkdown } from '../server/markdownProcessor';
import { ClientApp, IClientAppProps } from './ClientApp';
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner';
import { ContentService } from './services/content.service';

interface IAppProps {
    path?: string;
    clientScript?: string;
    styles?: string[];
    scripts?: string[];
}

async function AppContent({ path }: { path: string }) {
    // 1. Data Fetching (Server Side Only)
    const [tree, fileData] = await Promise.all([
        getAppFileTree(),
        getFileContent(path),
    ]);
    const content = fileData ? processMarkdown(fileData.content) : null;
    const metadata = fileData ? fileData.data : {};

    // Seed the cache so use() resolves immediately during SSR and first client render.
    // This prevents the server from attempting to fetch from itself during render.
    ContentService.setCache(path, { content, metadata });

    const initialData: IClientAppProps = { path, tree, content, metadata };

    return (
        <>
            <div id="root">
                <ClientApp {...initialData} />
            </div>

            {/* Hidden state for hydration */}
            <div
                id="ssr-state"
                data-payload={JSON.stringify(initialData)}
                style={{ display: 'none' }}
                aria-hidden="true"
            />
        </>
    );
}

export default function App({
    path = 'README.md',
    clientScript = '/src/hydrate.tsx',
    styles = [],
    scripts = [],
}: IAppProps) {
    // 3. Render HTML Shell
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <link rel="icon" type="image/png" href="/favicon.png?v=1" />
                <title>English Notes Viewer</title>
                <meta
                    name="description"
                    content="The interactive platform for mastering English with TTS and interactive reviews."
                />

                {/* Open Graph / WhatsApp / Facebook */}
                <meta property="og:type" content="website" />
                <meta
                    property="og:url"
                    content="https://learn-english-teal.vercel.app/"
                />
                <meta property="og:title" content="English Notes Viewer" />
                <meta
                    property="og:description"
                    content="Master Your English. Anytime, Anywhere. Interactive notes with instant Text-to-Speech."
                />
                <meta
                    property="og:image"
                    content="https://learn-english-teal.vercel.app/og-image.png"
                />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta
                    property="twitter:url"
                    content="https://learn-english-teal.vercel.app/"
                />
                <meta property="twitter:title" content="English Notes Viewer" />
                <meta
                    property="twitter:description"
                    content="Master Your English. Anytime, Anywhere. Interactive notes with instant Text-to-Speech."
                />
                <meta
                    property="twitter:image"
                    content="https://learn-english-teal.vercel.app/og-image.png"
                />

                {/* Critical Styles - Prevent FOUC */}
                {styles.map((href) => (
                    <link key={href} rel="stylesheet" href={href} />
                ))}

                {/* Dev Scripts - Prevent Syntax Errors */}
                {scripts.map((src) => (
                    <script key={src} type="module" src={src} />
                ))}
            </head>
            <body>
                <Suspense fallback={<LoadingSpinner />}>
                    <AppContent path={path} />
                </Suspense>

                {/* Hydration script */}
                <script type="module" src={clientScript} />
            </body>
        </html>
    );
}
