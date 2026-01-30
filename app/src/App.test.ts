/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createServer } from '../server/index';
import type { Express } from 'express';
import type { ViteDevServer } from 'vite';

describe('Homepage Integration Tests', () => {
    let app: Express;
    let vite: ViteDevServer | undefined;

    beforeAll(async () => {
        const server = await createServer();
        app = server.app;
        vite = server.vite;
    }, 15000); // Increase timeout for Vite startup

    afterAll(async () => {
        if (vite) await vite.close();
    });

    it('should render the homepage with title', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.text).toContain('English Notes Viewer');
        expect(response.text).toContain('English Notes');
    });

    it('should have sidebar with navigation', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.text).toContain('sidebar');
        expect(response.text).toContain('English Notes');
    });

    it('should render markdown content', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.text).toContain('class="markdown-viewer"');
    });

    it('should handle specific file path', async () => {
        const response = await request(app).get('/?path=README.md');

        expect(response.status).toBe(200);
        expect(response.text).toContain('English Notes');
    });

    it('should have proper HTML structure', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.text).toContain('<!DOCTYPE html>');
        expect(response.text).toContain('<html');
        expect(response.text).toContain('<head>');
        expect(response.text).toContain('<body>');
        expect(response.text).toContain('id="root"');
    });

    it('should load CSS stylesheets', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
        expect(response.text).toContain('rel="stylesheet"');
        expect(response.text).toContain('/src/global.css');
    });

    it('should handle 404 for non-existent files', async () => {
        // Silence expected console errors for cleaner test output
        const consoleSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        const response = await request(app).get('/?path=nonexistent.md');

        expect(response.status).toBe(200); // Still returns 200 but shows 404 content
        expect(response.text).toContain('404');
        expect(response.text).toContain('Content not found');

        consoleSpy.mockRestore();
    });
});
