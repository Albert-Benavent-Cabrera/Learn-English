import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { IFileNode } from '../../../../server/models/IFileNode';
import '../Sidebar-style.css';

interface ISidebarProps {
    tree: IFileNode[];
    currentPath: string;
    onNavigate: (path: string) => void;
}

export function Sidebar({ tree, currentPath, onNavigate }: ISidebarProps) {
    return (
        <div className="flex flex-col gap-1">
            {tree.map((node) => (
                <TreeNode
                    key={node.path}
                    node={node}
                    depth={0}
                    currentPath={currentPath}
                    onNavigate={onNavigate}
                />
            ))}
        </div>
    );
}

interface ITreeNodeProps {
    node: IFileNode;
    depth: number;
    currentPath: string;
    onNavigate: (path: string) => void;
}

function TreeNode({ node, depth, currentPath, onNavigate }: ITreeNodeProps) {
    const isFile = node.type === 'file';
    const isActive =
        isFile && (node.path === currentPath || currentPath === node.path);

    // Automatically open if currentPath is inside this directory
    // We check if currentPath starts with node.path/ to avoid partial matches
    const isOpen =
        !isFile &&
        (currentPath.startsWith(node.path + '/') || node.path === currentPath); // Should not happen for directories usually but good safety

    if (node.type === 'directory') {
        return (
            <details className="tree-node-group" open={depth === 0 || isOpen}>
                <summary
                    className="tree-node__link cursor-pointer list-none select-none flex items-center gap-2"
                    style={{ paddingLeft: `${depth * 12 + 4}px` }}
                >
                    <div className="summary-icons flex items-center shrink-0">
                        <div className="chevron-container w-[14px] flex items-center justify-center">
                            <ChevronRight
                                size={14}
                                className="tree-node__icon chevron-right"
                            />
                            <ChevronDown
                                size={14}
                                className="tree-node__icon chevron-down"
                            />
                        </div>
                        <Folder
                            size={18}
                            className="tree-node__icon text-sky-400"
                        />
                    </div>
                    <span className="tree-node__text truncate">
                        {node.name.replace(/-/g, ' ')}
                    </span>
                    {node.level && (
                        <span
                            className={`level-badge level-badge--${node.level.toLowerCase()} shrink-0`}
                        >
                            {node.level}
                        </span>
                    )}
                </summary>
                <div className="flex flex-col">
                    {node.children?.map((child: IFileNode) => (
                        <TreeNode
                            key={child.path}
                            node={child}
                            depth={depth + 1}
                            currentPath={currentPath}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            </details>
        );
    }

    return (
        <div className="tree-node">
            <a
                href={`?path=${node.path
                    .split('/')
                    .map((segment: string) => encodeURIComponent(segment))
                    .join('/')}`}
                onClick={(e) => {
                    e.preventDefault();
                    onNavigate(node.path);
                }}
                className={`tree-node__link flex items-center gap-2 ${isActive ? 'bg-slate-800/50 text-white' : ''}`}
                style={{ paddingLeft: `${depth * 12 + 4}px` }}
            >
                <span className="w-[14px] inline-block shrink-0" />
                <File
                    size={18}
                    className={`tree-node__icon shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-500'}`}
                />
                <span
                    className={`tree-node__text truncate ${isActive ? 'font-medium' : ''}`}
                >
                    {node.name.replace('.md', '').replace(/-/g, ' ')}
                </span>
                {node.level && (
                    <span
                        className={`level-badge level-badge--${node.level.toLowerCase()} shrink-0`}
                    >
                        {node.level}
                    </span>
                )}
            </a>
        </div>
    );
}
