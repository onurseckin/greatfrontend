import * as fileSystem from '../api/fileSystem';
import type { Project } from '../types/project';

// Load all projects from the file system
export const loadProjects = async (): Promise<Project[]> => {
  try {
    const projectList = await fileSystem.listProjects();
    const projects: Project[] = [];

    for (const projectInfo of projectList) {
      try {
        // Read the actual files
        const tsxPath = `${projectInfo.folderPath}/App.${projectInfo.type}`;
        const cssPath = `${projectInfo.folderPath}/styles.css`;

        const tsxContent = await fileSystem.readFile(tsxPath);
        const cssContent = await fileSystem.readFile(cssPath);

        // Try to read meta.ts for dates and folderName
        let createdAt = new Date();
        let updatedAt = new Date();
        let folderName = projectInfo.id; // fallback to id

        try {
          const metaPath = `${projectInfo.folderPath}/meta.ts`;
          const metaContent = await fileSystem.readFile(metaPath);

          const createdMatch = metaContent.match(/createdAt: '([^']+)'/);
          const updatedMatch = metaContent.match(/updatedAt: '([^']+)'/);
          const folderNameMatch = metaContent.match(/folderName: '([^']+)'/);

          if (createdMatch?.[1]) createdAt = new Date(createdMatch[1]);
          if (updatedMatch?.[1]) updatedAt = new Date(updatedMatch[1]);
          if (folderNameMatch?.[1]) folderName = folderNameMatch[1];
        } catch (e) {
          console.warn(`Could not read meta.ts for ${projectInfo.name}:`, e);
        }

        projects.push({
          id: projectInfo.id,
          projectId: projectInfo.projectId,
          name: projectInfo.name,
          type: projectInfo.type,
          tsxContent,
          cssContent,
          createdAt,
          updatedAt,
          folderPath: projectInfo.folderPath,
        });
      } catch (error) {
        console.error(`Failed to load project ${projectInfo.name}:`, error);
      }
    }

    return projects.sort((a, b) => a.projectId - b.projectId);
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
  type: 'tsx' | 'jsx',
  customId?: number
): Promise<Project> => {
  try {
    const projectInfo = await fileSystem.createProject(name, type, customId);

    // Read the created files to return a complete Project object
    const tsxPath = `${projectInfo.folderPath}/App.${type}`;
    const cssPath = `${projectInfo.folderPath}/styles.css`;

    const tsxContent = await fileSystem.readFile(tsxPath);
    const cssContent = await fileSystem.readFile(cssPath);

    return {
      id: projectInfo.id,
      projectId: projectInfo.projectId,
      name: projectInfo.name,
      type: projectInfo.type,
      tsxContent,
      cssContent,
      createdAt: new Date(),
      updatedAt: new Date(),
      folderPath: projectInfo.folderPath,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create project'
    );
  }
};

// Update project - this will write to the actual files
export const updateProject = async (project: Project): Promise<void> => {
  try {
    const now = new Date();

    // Write the TSX/JSX file
    const tsxPath = `${project.folderPath}/App.${project.type}`;
    await fileSystem.writeFile(tsxPath, project.tsxContent);

    // Write the CSS file
    const cssPath = `${project.folderPath}/styles.css`;
    await fileSystem.writeFile(cssPath, project.cssContent);

    // Update meta.ts with new timestamp
    const metaPath = `${project.folderPath}/meta.ts`;
    try {
      const metaContent = await fileSystem.readFile(metaPath);
      const updatedMeta = metaContent.replace(
        /updatedAt: '[^']*'/,
        `updatedAt: '${now.toISOString()}'`
      );
      await fileSystem.writeFile(metaPath, updatedMeta);
    } catch (error) {
      console.warn('Could not update meta.ts timestamp:', error);
    }
  } catch (error) {
    console.error('Failed to update project:', error);
    throw new Error('Failed to save project files');
  }
};

// Delete project (removes both project files and debug output)
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    await fileSystem.deleteProject(projectId);
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw new Error('Failed to delete project');
  }
};

// Get next available project ID (this is now handled by the API)
export const getNextProjectId = async (customId?: number): Promise<number> => {
  try {
    const projects = await fileSystem.listProjects();
    const existingIds = projects.map(p => p.projectId).sort((a, b) => a - b);

    if (customId) {
      if (existingIds.includes(customId)) {
        throw new Error(`Project ID ${customId} is already taken`);
      }
      return customId;
    }

    let nextId = 1;
    for (const id of existingIds) {
      if (nextId < id) break;
      nextId = id + 1;
    }

    return nextId;
  } catch (error) {
    console.error('Failed to get next project ID:', error);
    return customId || 1;
  }
};
