import { Menu, X } from 'lucide-react';

interface IMobileMenuProps {
    onToggle: (isOpen: boolean) => void;
    isOpen: boolean;
}

export function MobileMenu({ onToggle, isOpen }: IMobileMenuProps) {
    return (
        <>
            {/* Mobile menu button */}
            <button
                className="md:hidden fixed top-4 left-4 z-60 p-2 rounded-lg bg-slate-800 text-sky-400 border border-slate-700 hover:bg-slate-700 active:scale-95 transition-all"
                style={{ touchAction: 'manipulation' }}
                onClick={() => onToggle(!isOpen)}
                aria-label="Toggle menu"
                type="button"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => onToggle(false)}
                />
            )}
        </>
    );
}
