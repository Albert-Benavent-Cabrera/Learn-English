import { useState } from 'react';
import { MobileMenu } from './components/MobileMenu';
import { Sidebar } from './components/Sidebar';
import { IFileNode } from '../../../server/models/IFileNode';

interface ISidebarWrapperProps {
    tree: IFileNode[];
    currentPath: string;
    onNavigate: (path: string) => void;
}

export function SidebarWrapper({
    tree,
    currentPath,
    onNavigate,
}: ISidebarWrapperProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <>
            <MobileMenu isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} />

            {/* Sidebar */}
            <div className="sidebar-wrapper">
                <nav
                    id="app-sidebar"
                    className={`sidebar ${isSidebarOpen ? 'sidebar--open' : ''}`}
                >
                    <div className="flex items-center justify-between mb-8 pl-14 md:pl-0">
                        <span className="sidebar__title !mb-0">
                            English Notes
                        </span>
                    </div>
                    <Sidebar
                        tree={tree}
                        currentPath={currentPath}
                        onNavigate={(path) => {
                            onNavigate(path);
                            setIsSidebarOpen(false);
                        }}
                    />
                </nav>
            </div>
        </>
    );
}
