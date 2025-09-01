// File system operations API
const API_BASE = '/api';

export interface FileContent {
  content: string;
  path: string;
}

// Read a file from the file system
export const readFile = async (filePath: string): Promise<string> => {
  const response = await fetch(`${API_BASE}/files/read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: filePath }),
  });

  if (!response.ok) {
    throw new Error(`Failed to read file: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content;
};

// Write a file to the file system
export const writeFile = async (filePath: string, content: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/files/write`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: filePath, content }),
  });

  if (!response.ok) {
    throw new Error(`Failed to write file: ${response.statusText}`);
  }
};

// List projects by scanning the projects directory
export const listProjects = async (): Promise<Array<{
  id: string;
  projectId: number;
  name: string;
  type: 'tsx' | 'jsx';
  folderPath: string;
}>> => {
  const response = await fetch(`${API_BASE}/projects/list`);

  if (!response.ok) {
    throw new Error(`Failed to list projects: ${response.statusText}`);
  }

  return response.json();
};

// Create a new project with files
export const createProject = async (
  name: string,
  type: 'tsx' | 'jsx',
  customId?: number
): Promise<{
  id: string;
  projectId: number;
  name: string;
  type: 'tsx' | 'jsx';
  folderPath: string;
}> => {
  const response = await fetch(`${API_BASE}/projects/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, type, customId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `Failed to create project: ${response.statusText}`);
  }

  return response.json();
};

// Delete a project
export const deleteProject = async (projectId: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/projects/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ projectId }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete project: ${response.statusText}`);
  }
};
