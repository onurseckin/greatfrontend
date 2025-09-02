export interface ProjectMeta {
  projectId: number;
  name: string;
  type: 'tsx' | 'jsx';
  folderName: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
  tags?: string[];
}

export interface Project {
  id: string; // folder name like "11-progress-bar"
  projectId: number;
  name: string;
  type: 'tsx' | 'jsx';
  tsxContent: string;
  cssContent: string;
  createdAt: Date;
  updatedAt: Date;
  folderPath: string;
}

export interface ProjectFile {
  content: string;
  language: 'typescript' | 'javascript' | 'css';
}
