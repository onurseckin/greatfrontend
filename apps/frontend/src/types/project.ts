export interface ProjectMeta {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  type: 'tsx' | 'jsx';
  createdAt: Date;
  updatedAt: Date;
}

export interface Project extends ProjectMeta {
  tsxContent: string;
  cssContent: string;
}

export type Language = 'typescript' | 'javascript' | 'css';
