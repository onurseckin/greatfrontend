import * as api from '../api/projects';
import type { Project } from '../types/project';

// Load all projects from the database
export const loadProjects = async (): Promise<Project[]> => {
  try {
    const metas = await api.listProjects();
    const projects: Project[] = [];
    for (const m of metas) {
      const full = await api.getProject(m.id);
      projects.push(full);
    }
    return projects.sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error('Failed to load projects:', error);
    return [];
  }
};

// Save projects - this will write to the actual files
export const saveProjects = async (): Promise<void> => {
  // This function is called when the project list changes
  // Individual file saves are handled by updateProject
};

// Create new project using the API
export const createNewProject = async (
  name: string,
  type: 'tsx' | 'jsx'
): Promise<Project> => {
  try {
    const created = await api.createProject({ name, type });
    return created;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create project'
    );
  }
};

// Update project - save to DB
export const updateProject = async (project: Project): Promise<void> => {
  try {
    await api.updateProject(project.id, {
      name: project.name,
      description: null,
      tsxContent: project.tsxContent,
      cssContent: project.cssContent,
    });
  } catch (error) {
    console.error('Failed to update project:', error);
    throw new Error('Failed to save project files');
  }
};

// Delete project (removes both project files and debug output)
export const deleteProject = async (projectId: number): Promise<void> => {
  try {
    await api.deleteProject(projectId);
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw new Error('Failed to delete project');
  }
};

// Get next available project ID (this is now handled by the API)
export const getNextProjectId = async (): Promise<number> => {
  try {
    const projects = await api.listProjects();
    const existingIds = projects.map(p => p.id).sort((a, b) => a - b);

    let nextId = 1;
    for (const id of existingIds) {
      if (nextId < id) break;
      nextId = id + 1;
    }

    return nextId;
  } catch (error) {
    console.error('Failed to get next project ID:', error);
    return 1;
  }
};
