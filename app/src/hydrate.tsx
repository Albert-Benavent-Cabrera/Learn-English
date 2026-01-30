import { hydrateRoot } from 'react-dom/client';
import { logError } from '@/utils/error-utils';
import { ClientApp } from './ClientApp';
import './global.css';
import './components/LoadingSpinner/LoadingSpinner-style.css';
import './components/Sidebar/Sidebar-style.css';
import './components/MarkdownViewer/MarkdownViewer-style.css';
import './components/Translator/Translator-style.css';

const container = document.getElementById('root');
const stateElement = document.getElementById('ssr-state');

if (container && stateElement) {
    try {
        const payload = stateElement.getAttribute('data-payload');
        if (payload) {
            const initialData = JSON.parse(payload);
            hydrateRoot(container, <ClientApp {...initialData} />);
        }
    } catch (error) {
        logError('Hydration', error);
    }
}
