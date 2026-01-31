import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Translator } from './Translator';

// Mock fetch global
global.fetch = vi.fn();

describe('Translator Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should toggle visibility when button is clicked', () => {
        render(<Translator />);

        // Panel should be hidden initially
        expect(screen.queryByTestId('translator-panel')).toBeNull();

        // Click toggle button
        const toggleBtn = screen.getByLabelText('Toggle Translator');
        fireEvent.click(toggleBtn);

        // Panel should be visible now
        expect(screen.getByTestId('translator-panel')).toBeInTheDocument();

        // Click toggle button again
        fireEvent.click(toggleBtn);

        // Panel should be hidden again
        expect(screen.queryByTestId('translator-panel')).toBeNull();
    });

    it('should close when X button inside panel is clicked', () => {
        render(<Translator />);

        // Open panel
        const toggleBtn = screen.getByLabelText('Toggle Translator');
        fireEvent.click(toggleBtn);

        // Click close button inside panel
        const closeBtn = screen.getByTestId('close-translator');
        fireEvent.click(closeBtn);

        // Panel should be hidden
        expect(screen.queryByTestId('translator-panel')).toBeNull();
    });

    it('should toggle translation direction and update UI', () => {
        render(<Translator />);
        fireEvent.click(screen.getByLabelText('Toggle Translator'));

        // Default: ES -> EN
        expect(screen.getByText(/ES 🇪🇸/)).toBeInTheDocument();
        expect(screen.getByText(/EN 🇬🇧/)).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('Escribe en español...')
        ).toBeInTheDocument();
        expect(screen.getByText('Traducir')).toBeInTheDocument();

        // Click toggle
        const toggleDirBtn = screen.getByTitle('Cambiar dirección');
        fireEvent.click(toggleDirBtn);

        // Now: EN -> ES
        expect(screen.getByText(/EN 🇬🇧/)).toBeInTheDocument();
        expect(screen.getByText(/ES 🇪🇸/)).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('Write in English...')
        ).toBeInTheDocument();
        expect(screen.getByText('Translate')).toBeInTheDocument();
    });

    it('should translate correctly in ES -> EN direction', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ translatedText: 'Hello world', match: 1 }),
        } as Response);

        render(<Translator />);
        fireEvent.click(screen.getByLabelText('Toggle Translator'));

        const textarea = screen.getByPlaceholderText('Escribe en español...');
        fireEvent.change(textarea, { target: { value: 'Hola mundo' } });

        const translateBtn = screen.getByText('Traducir');
        fireEvent.click(translateBtn);

        await waitFor(() => {
            expect(screen.getByText('Hello world')).toBeInTheDocument();
        });

        // Label should say English
        expect(screen.getByText('English')).toBeInTheDocument();

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/translate',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    text: 'Hola mundo',
                    source: 'es',
                    target: 'en-GB',
                }),
            })
        );
    });

    it('should translate correctly in EN -> ES direction', async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ translatedText: 'Hola mundo', match: 1 }),
        } as Response);

        render(<Translator />);
        fireEvent.click(screen.getByLabelText('Toggle Translator'));

        // Toggle to EN -> ES
        fireEvent.click(screen.getByTitle('Cambiar dirección'));

        const textarea = screen.getByPlaceholderText('Write in English...');
        fireEvent.change(textarea, { target: { value: 'Hello world' } });

        const translateBtn = screen.getByText('Translate');
        fireEvent.click(translateBtn);

        await waitFor(() => {
            expect(screen.getByText('Hola mundo')).toBeInTheDocument();
        });

        // Label should say Español
        expect(screen.getByText('Español')).toBeInTheDocument();

        expect(global.fetch).toHaveBeenCalledWith(
            '/api/translate',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    text: 'Hello world',
                    source: 'en',
                    target: 'es',
                }),
            })
        );
    });
});
