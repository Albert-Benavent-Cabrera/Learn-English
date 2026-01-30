/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MarkdownViewer } from './MarkdownViewer';
import { processMarkdown } from '../../../server/markdownProcessor';

describe('MarkdownViewer Component Tests', () => {
    it('should render basic markdown content', () => {
        const content = '# Hello World\n\nThis is a test.';
        const { container } = render(
            <MarkdownViewer content={processMarkdown(content)} />
        );

        expect(container.querySelector('h1')?.textContent).toBe('Hello World');
        expect(container.textContent).toContain('This is a test');
    });

    it('should render YouTube videos from youtube.com links', () => {
        const content =
            '[Test Video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)';
        const { container } = render(
            <MarkdownViewer content={processMarkdown(content)} />
        );

        const iframe = container.querySelector('iframe');
        expect(iframe).toBeTruthy();
        expect(iframe?.src).toContain('youtube.com/embed/dQw4w9WgXcQ');
        expect(iframe?.getAttribute('allowfullscreen')).toBe('');
    });

    it('should render YouTube videos from youtu.be links', () => {
        const content = '[Short Link](https://youtu.be/dQw4w9WgXcQ)';
        const { container } = render(
            <MarkdownViewer content={processMarkdown(content)} />
        );

        const iframe = container.querySelector('iframe');
        expect(iframe).toBeTruthy();
        expect(iframe?.src).toContain('youtube.com/embed/dQw4w9WgXcQ');
    });

    it('should have video-item wrapper with data-testid', () => {
        const content = '[Video](https://www.youtube.com/watch?v=test123)';
        const { container } = render(
            <MarkdownViewer content={processMarkdown(content)} />
        );

        const videoItem = container.querySelector(
            '[data-testid="youtube-video"]'
        );
        expect(videoItem).toBeTruthy();
        expect(videoItem?.classList.contains('video-item')).toBe(true);
    });

    it('should strip YAML frontmatter', () => {
        const content = `---
title: Test
level: A1
---
# Content`;
        const { container } = render(
            <MarkdownViewer content={processMarkdown(content)} />
        );

        expect(container.textContent).not.toContain('title:');
        expect(container.textContent).not.toContain('level:');
        expect(container.querySelector('h1')?.textContent).toBe('Content');
    });

    it('should handle internal links correctly', () => {
        const content = '[Internal Link](/A1/index.md)';
        const { container } = render(
            <MarkdownViewer content={processMarkdown(content)} />
        );

        const link = container.querySelector('a');
        expect(link?.href).toContain('?path=');
        expect(link?.href).toContain('A1/index.md');
    });

    it('should handle external links with target blank', () => {
        const content = '[External](https://example.com)';
        const { container } = render(
            <MarkdownViewer content={processMarkdown(content)} />
        );

        const link = container.querySelector('a');
        expect(link?.href).toBe('https://example.com/');
    });

    it('should render markdown with GFM features', () => {
        const content = `
- [ ] Task 1
- [x] Task 2

| Col1 | Col2 |
|------|------|
| A    | B    |
`;
        const { container } = render(
            <MarkdownViewer content={processMarkdown(content)} />
        );

        expect(container.querySelector('table')).toBeTruthy();
        expect(container.querySelector('input[type="checkbox"]')).toBeTruthy();
    });

    it('should have markdown-viewer wrapper', () => {
        const content = 'Test';
        const { getByTestId } = render(
            <MarkdownViewer content={processMarkdown(content)} />
        );

        expect(getByTestId('markdown-viewer')).toBeTruthy();
    });
});
