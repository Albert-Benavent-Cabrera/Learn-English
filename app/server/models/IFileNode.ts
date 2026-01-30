export interface IFileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    level?: string;
    children?: IFileNode[];
}
