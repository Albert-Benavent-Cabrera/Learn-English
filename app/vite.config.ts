import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        {
            name: 'watch-content',
            configureServer(server) {
                const contentPath = path.resolve(__dirname, '../contenido');
                server.watcher.add(contentPath);
                server.watcher.on('change', (file) => {
                    if (file.startsWith(contentPath)) {
                        server.ws.send({ type: 'full-reload' });
                    }
                });
            },
        },
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/._*',
            '**/cypress/**',
            '**/.{idea,git,cache,output,temp}/**',
        ],
        setupFiles: ['./src/setupTests.ts'],
    },
    build: {
        manifest: true,
        rollupOptions: {
            input: './src/hydrate.tsx',
        },
    },
    ssr: {
        noExternal: true,
        external: [
            'react',
            'react-dom',
            'react-dom/server',
            'gray-matter',
            'sanitize-html',
            'marked',
        ],
    },
});
