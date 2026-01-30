import chokidar from 'chokidar';
import path from 'path';
import { Logger } from './logger.js';
import { generateTree } from '../scripts/generate-tree.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, '../../content');

export function startContentWatcher() {
    Logger.info(`[Watcher] Starting content watcher in: ${CONTENT_DIR}`);

    // Initial generation
    generateTree();

    const watcher = chokidar.watch(CONTENT_DIR, {
        ignored: new RegExp('(^|[\\\\/])\\..'), // ignore dotfiles
        persistent: true,
        ignoreInitial: true,
    });

    watcher
        .on('add', (path) => {
            Logger.info(`[Watcher] File added: ${path}`);
            generateTree();
        })
        .on('change', (path) => {
            Logger.info(`[Watcher] File changed: ${path}`);
            generateTree();
        })
        .on('unlink', (path) => {
            Logger.info(`[Watcher] File removed: ${path}`);
            generateTree();
        })
        .on('addDir', (path) => {
            Logger.info(`[Watcher] Directory added: ${path}`);
            generateTree();
        })
        .on('unlinkDir', (path) => {
            Logger.info(`[Watcher] Directory removed: ${path}`);
            generateTree();
        });

    return watcher;
}
