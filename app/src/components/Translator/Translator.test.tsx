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

    it('should translate text when input is submitted', async () => {
        // Mock successful response
        vi.mocked(fetch).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ translatedText: 'Hello world', match: 1 }),
        } as Response);

        render(<Translator />);

        // Open panel
        fireEvent.click(screen.getByLabelText('Toggle Translator'));

        // Type text
        const textarea = screen.getByPlaceholderText('Escribe en español...');
        fireEvent.change(textarea, { target: { value: 'Hola mundo' } });

        // Click translate button
        const translateBtn = screen.getByText('Translate');
        fireEvent.click(translateBtn);

        // Button should show loading state (optional check, might be too fast)

        // Wait for result
        await waitFor(() => {
            expect(screen.getByText('Hello world')).toBeInTheDocument();
        });

        // Verify API call
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
});
