import path from 'path';
import fs from 'fs/promises';
import matter from 'gray-matter';
import { IFileNode } from './models/IFileNode.js';
import { fileURLToPath } from 'url';

// Helper to find directories relative to this file (base is app/server/ or dist/server/)
import { existsSync } from 'fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Discovery logic: find the folder that contains the 'content' directory
function findDataRoot(start: string): string {
    let curr = start;
    for (let i = 0; i < 5; i++) {
        if (existsSync(path.join(curr, 'content'))) return curr;
        const parent = path.dirname(curr);
        if (parent === curr) break;
        curr = parent;
    }
    // Fallback: previous default
    return path.resolve(__dirname, '..');
}

const rootDir = findDataRoot(__dirname);
console.log('[fileTree] Resolved rootDir:', rootDir);

/**
 * Get the file tree from pre-generated tree.json
 * This is much faster than reading the filesystem on every request
 */
export async function getAppFileTree(): Promise<IFileNode[]> {
    const treePaths = [
        path.join(rootDir, 'public', 'tree.json'),
        path.join(rootDir, 'dist/public', 'tree.json'),
        path.join(rootDir, 'dist', 'tree.json'),
    ];

    for (const p of treePaths) {
        try {
            const treeData = await fs.readFile(p, 'utf-8');
            return JSON.parse(treeData);
        } catch {
            // Check next path
        }
    }
    throw new Error(
        `Could not find tree.json in any of: ${treePaths.join(', ')}`
    );
}

/**
 * Get and parse markdown file content
 */
import { IFrontmatter } from './models/IFrontmatter.js';

/**
 * Get and parse markdown file content
 */
export async function getFileContent(
    filePath: string
): Promise<{ content: string; data: IFrontmatter } | null> {
    try {
        const contentDir = path.join(rootDir, 'content');
        const fullPath = path.join(contentDir, filePath);

        // Security: prevent path traversal
        if (!fullPath.startsWith(contentDir)) {
            console.warn(`[Security] Path traversal attempt: ${filePath}`);
            return null;
        }

        const fileContent = await fs.readFile(fullPath, 'utf-8');
        const { content, data } = matter(fileContent);
        return { content, data: data as IFrontmatter };
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return null;
    }
}
