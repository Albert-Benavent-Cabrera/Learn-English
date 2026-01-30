import express from 'express';
import path from 'path';
import { Logger } from './logger.js';
import { getFileContent } from './fileTree.js';
import { processMarkdown } from './markdownProcessor.js';

import { renderToPipeableStream } from 'react-dom/server';
import React from 'react';

const port = 3000;

// Helper to find the dist directory
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import type { ViteDevServer } from 'vite';

async function createServer() {
    const app = express();
    let vite: ViteDevServer | undefined;

    console.log('[Server] NODE_ENV:', process.env.NODE_ENV);
    console.log('[Server] __dirname:', __dirname);

    if (process.env.NODE_ENV !== 'production') {
        const { createServer: createViteServer } = await import('vite');
        vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'custom',
            configFile: path.resolve(__dirname, '../vite.config.ts'),
        });
        app.use(vite.middlewares);

        // Serve Vite React Refresh Preamble from memory (Dev only)
        app.get('/dev-preamble.js', (req, res) => {
            res.type('js');
            res.send(`
                import RefreshRuntime from '/@react-refresh';
                RefreshRuntime.injectIntoGlobalHook(window);
                window.$RefreshReg$ = () => {};
                window.$RefreshSig$ = () => (type) => type;
                window.__vite_plugin_react_preamble_installed__ = true;
            `);
        });

        // Start Content Watcher
        const { startContentWatcher } = await import('./watcher.js');
        startContentWatcher();
    } else {
        // Serve static files in production (dist/client)
        const clientDist = path.resolve(__dirname, '../dist');
        console.log('[Server] Serving static from:', clientDist);
        app.use(express.static(clientDist, { index: false }));
    }

    // Middleware for JSON body parsing
    app.use(express.json());

    // API Endpoint for SPA transitions
    app.get('/api/content', async (req, res) => {
        try {
            const pathParam = (req.query.path as string) || 'README.md';
            const fileData = await getFileContent(pathParam);
            const content = fileData ? processMarkdown(fileData.content) : null;
            const metadata = fileData ? fileData.data : {};
            res.json({ content, metadata });
        } catch (e) {
            console.error('API Error:', e);
            res.status(500).json({ error: 'Failed to fetch content' });
        }
    });

    // API Endpoint for Translation
    app.post('/api/translate', async (req, res) => {
        try {
            const { text, source = 'es', target = 'en' } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Text is required' });
            }

            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data && Array.isArray(data) && data[0]) {
                // Google returns an array of sentences, we join them
                const translatedText = data[0]
                    .map((item: string[]) => item[0])
                    .join('');
                res.json({
                    translatedText,
                    match: 1, // Mock match score
                });
            } else {
                throw new Error('Invalid response from translation service');
            }
        } catch (e) {
            console.error('Translation Error:', e);
            res.status(500).json({ error: 'Failed to translate text' });
        }
    });

    // SSR Endpoint (Root)
    app.use('*all', async (req, res) => {
        if (
            req.originalUrl === '/favicon.ico' ||
            req.originalUrl === '/favicon.png'
        ) {
            return res.status(404).end();
        }

        try {
            const pathParam = (req.query.path as string) || 'README.md';

            // Environment-specific asset orchestrator
            let clientScript = '/src/hydrate.tsx';
            let styles: string[] = [];
            let scripts: string[] = [];
            let App;

            if (process.env.NODE_ENV === 'production') {
                const fs = await import('fs');
                try {
                    const manifestPath = path.resolve(
                        __dirname,
                        '../dist/.vite/manifest.json'
                    );
                    const manifest = JSON.parse(
                        fs.readFileSync(manifestPath, 'utf-8')
                    );
                    const entry = manifest['src/hydrate.tsx'];
                    if (entry) {
                        clientScript = '/' + entry.file;
                        if (entry.css) {
                            styles = entry.css.map((c: string) => '/' + c);
                        }
                    }
                } catch (e) {
                    console.error('Failed to load manifest.json:', e);
                }

                const mod = await import('../dist/server/App.js');
                App = mod.default;
            } else {
                // Development Assets
                styles = [
                    '/src/components/MarkdownViewer/MarkdownViewer-style.css',
                    '/src/components/Sidebar/Sidebar-style.css',
                    '/src/components/LoadingSpinner/LoadingSpinner-style.css',
                    '/src/components/Translator/Translator-style.css',
                    '/src/global.css',
                ];
                // Vite specific scripts
                scripts = ['/@vite/client', '/dev-preamble.js'];

                if (!vite) throw new Error('Vite server not initialized');
                const mod = await vite.ssrLoadModule('/src/App.tsx');
                App = mod.default;
            }

            // Fetch initial content for SSR
            const fileData = await getFileContent(pathParam);
            const initialContent = fileData
                ? processMarkdown(fileData.content)
                : null;
            const initialMetadata = fileData ? fileData.data : {};

            res.setHeader('Content-Type', 'text/html');

            const { pipe } = renderToPipeableStream(
                React.createElement(App, {
                    path: pathParam,
                    clientScript,
                    styles,
                    scripts,
                    initialContent,
                    initialMetadata,
                }),
                {
                    onShellReady() {
                        res.write('<!DOCTYPE html>');
                        pipe(res);
                    },
                    onError(err) {
                        const error = err as Error;
                        Logger.error('SSR Error:', error);
                        if (!res.headersSent) {
                            res.status(500).send(`
                                <body style="background: #000; color: #fff; font-family: monospace; padding: 2rem;">
                                    <h1 style="color: #ff5555;">SSR Error Occurred</h1>
                                    <pre style="background: #1a1a1a; padding: 1rem; border-radius: 4px; border: 1px solid #333; overflow: auto; white-space: pre-wrap;">${error.stack || error.message || error}</pre>
                                    <hr style="border: 0; border-top: 1px solid #333; margin: 2rem 0;"/>
                                    <p style="color: #888;">__dirname: ${__dirname}</p>
                                </body>
                            `);
                        }
                    },
                }
            );
        } catch (e) {
            const error = e as Error;
            if (vite) {
                try {
                    vite.ssrFixStacktrace(error);
                } catch (stackError) {
                    console.error('Failed to fix stacktrace:', stackError);
                }
            }
            console.error('Final SSR Error:', error);
            if (!res.headersSent) {
                res.status(500).send(`
                    <body style="background: #000; color: #fff; font-family: monospace; padding: 2rem;">
                        <h1 style="color: #ff5555;">Critical Server Error</h1>
                        <pre style="background: #1a1a1a; padding: 1rem; border-radius: 4px; border: 1px solid #333; overflow: auto; white-space: pre-wrap;">${error.stack || error.message || error}</pre>
                    </body>
                `);
            }
        }
    });

    return { app, vite };
}

// Only start the server if this file is run directly
const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
    createServer().then(({ app }) => {
        app.listen(port, () => {
            if (process.env.NODE_ENV !== 'production') {
                console.log(`Server running at http://localhost:${port}`);
            }
        });
    });
}

export { createServer };
