export interface IFrontmatter {
    title?: string;
    description?: string;
    level?: string;
    order?: number;
    // Use a specific union type to satisfy linting rules
    [key: string]: string | number | boolean | null | undefined | string[];
}
