import fs from 'node:fs';
import path from 'node:path';
import { IFileNode } from '../server/models/IFileNode';
import { Logger } from '../server/logger';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

function parseLevel(content: string): string | undefined {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (!match) return undefined;

    const frontmatter = match[1];
    const levelMatch = frontmatter.match(/^level:\s*["']?(.*?)["']?$/m);
    return levelMatch ? levelMatch[1].trim() : undefined;
}

function getFileTree(dir: string): IFileNode[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    const nodes: IFileNode[] = entries
        .filter((entry) => !entry.name.startsWith('.'))
        .map((entry) => {
            const fullPath = path.join(dir, entry.name);
            const relativePath = path.relative(CONTENT_DIR, fullPath);

            const node: IFileNode = {
                name: entry.name,
                path: relativePath,
                type: entry.isDirectory() ? 'directory' : 'file',
            };

            if (entry.isDirectory()) {
                node.children = getFileTree(fullPath);
            } else if (entry.name.endsWith('.md')) {
                const content = fs.readFileSync(fullPath, 'utf8');
                node.level = parseLevel(content);
            }

            return node;
        });

    return nodes.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        const aIsIndex = a.name.toLowerCase().startsWith('index');
        const bIsIndex = b.name.toLowerCase().startsWith('index');
        if (aIsIndex && !bIsIndex) return -1;
        if (!aIsIndex && bIsIndex) return 1;
        return a.name.localeCompare(b.name);
    });
}

export function generateTree() {
    Logger.info('Generating file tree...');
    const tree = getFileTree(CONTENT_DIR);
    fs.writeFileSync(
        path.join(PUBLIC_DIR, 'tree.json'),
        JSON.stringify(tree, null, 2)
    );
    Logger.info('Tree generated in public/tree.json');
}

// Run immediately if executed as a script
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generateTree();
}
