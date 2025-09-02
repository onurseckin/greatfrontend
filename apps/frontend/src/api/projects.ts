const API = '/api/projects';

export interface ProjectMeta {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  type: 'tsx' | 'jsx';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFull extends ProjectMeta {
  tsxContent: string;
  cssContent: string;
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const res = await fetch(`${API}/list`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.map(
    (
      project: Omit<ProjectMeta, 'createdAt' | 'updatedAt'> & {
        createdAt: string;
        updatedAt: string;
      }
    ) => ({
      ...project,
      createdAt: new Date(project.createdAt),
      updatedAt: new Date(project.updatedAt),
    })
  );
}

export async function getProject(id: number): Promise<ProjectFull> {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

export async function createProject(input: {
  name: string;
  type: 'tsx' | 'jsx';
  description?: string | null;
}): Promise<ProjectFull> {
  const res = await fetch(`${API}/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

export async function updateProject(
  id: number,
  input: Partial<{
    name: string;
    description: string | null;
    tsxContent: string;
    cssContent: string;
  }>
): Promise<ProjectFull> {
  const res = await fetch(`${API}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return {
    ...data,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
  };
}

export async function deleteProject(id: number): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
}
