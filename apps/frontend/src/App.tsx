import { Code, Eye, Monitor, Plus, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import CodeEditor from './components/CodeEditor';
import LiveRenderer from './components/LiveRenderer';
import NewProjectModal from './components/NewProjectModal';

import * as api from './api/projects';
import ProjectTable from './components/ProjectTable';
import type { Project } from './types/project';
import {
  createNewProject,
  deleteProject,
  loadProjects,
  saveProjects,
} from './utils/projectUtils';

// Component for project details page
function ProjectDetails() {
  const { folderName } = useParams<{ folderName: string }>();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<
    'all' | 'code-only' | 'preview-only'
  >('all');
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const initializeProjects = async () => {
      const loadedProjects = await loadProjects();
      setProjects(loadedProjects);

      if (folderName) {
        const found = loadedProjects.find(p => String(p.id) === folderName);
        setSelectedProject(found || null);
        // hydrate from localStorage if unsaved exists
        try {
          const cached = localStorage.getItem(`project-${folderName}`);
          if (cached) {
            const draft = JSON.parse(cached) as Partial<Project>;
            setSelectedProject(prev =>
              prev ? ({ ...prev, ...draft } as Project) : prev
            );
            setIsDirty(true);
          }
        } catch {
          // Ignore parsing errors for draft content
        }
      }
    };

    initializeProjects();
  }, [folderName]);

  useEffect(() => {
    if (projects.length > 0) {
      saveProjects();
    }
  }, [projects]);

  const handleCodeChange = async (
    field: 'tsxContent' | 'cssContent',
    value: string
  ) => {
    if (!selectedProject) return;

    const updatedProject = {
      ...selectedProject,
      [field]: value,
      updatedAt: new Date(),
    } as Project;

    // Update the UI immediately for responsiveness
    setSelectedProject(updatedProject);
    setProjects(prev =>
      prev.map(p => (p.id === selectedProject.id ? updatedProject : p))
    );

    // mark dirty and cache to localStorage
    setIsDirty(true);
    try {
      localStorage.setItem(
        `project-${selectedProject.id}`,
        JSON.stringify({
          tsxContent: updatedProject.tsxContent,
          cssContent: updatedProject.cssContent,
        })
      );
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleSave = async () => {
    if (!selectedProject) return;
    setIsSaving(true);
    try {
      const saved = await api.updateProject(selectedProject.id, {
        name: selectedProject.name,
        description: null,
        tsxContent: selectedProject.tsxContent,
        cssContent: selectedProject.cssContent,
      });
      // convert string dates to Date for existing state shape
      setSelectedProject({
        ...saved,
        createdAt: new Date(saved.createdAt),
        updatedAt: new Date(saved.updatedAt),
      } as unknown as Project);
      setIsDirty(false);
      localStorage.removeItem(`project-${selectedProject.id}`);
    } catch (e) {
      console.error('Save failed', e);
      alert('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateProject = async (name: string, type: 'tsx' | 'jsx') => {
    try {
      const newProject = await createNewProject(name, type);
      const updatedProjects = await loadProjects(); // Reload from registry
      setProjects(updatedProjects);
      navigate(`/${newProject.id}`);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Failed to create project'
      );
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!selectedProject) {
    return <div>Loading...</div>;
  }

  const showCodeEditors = viewMode === 'all' || viewMode === 'code-only';
  const showPreview = viewMode === 'all' || viewMode === 'preview-only';

  return (
    <div className="main-content">
      <div className="header">
        <div className="header-left">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            ← Back to Projects
          </button>
          <h1>{selectedProject.name}</h1>
          <button
            className="btn-secondary refresh-btn"
            onClick={handleRefresh}
            title="Refresh page"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="header-right">
          <div className="view-toggles">
            <button
              className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
              title="Show all panels"
            >
              <Monitor size={16} />
              All
            </button>
            <button
              className={`toggle-btn ${viewMode === 'code-only' ? 'active' : ''}`}
              onClick={() => setViewMode('code-only')}
              title="Show code editors only"
            >
              <Code size={16} />
              Code
            </button>
            <button
              className={`toggle-btn ${viewMode === 'preview-only' ? 'active' : ''}`}
              onClick={() => setViewMode('preview-only')}
              title="Show preview only"
            >
              <Eye size={16} />
              Preview
            </button>
          </div>

          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            New Project
          </button>
          {selectedProject && (
            <button
              className="btn-secondary"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              title={isDirty ? 'Save changes' : 'All changes saved'}
              style={{ marginLeft: 8 }}
            >
              {isSaving ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
            </button>
          )}
        </div>
      </div>

      <div className="editor-layout">
        <PanelGroup direction="horizontal" className="panel-group">
          {showCodeEditors && (
            <>
              <Panel defaultSize={33} minSize={20}>
                <CodeEditor
                  value={selectedProject.tsxContent}
                  language="typescript"
                  onChange={value => handleCodeChange('tsxContent', value)}
                  title={`Component (${selectedProject.type})`}
                />
              </Panel>
              <PanelResizeHandle className="panel-resize-handle" />
              <Panel defaultSize={33} minSize={20}>
                <CodeEditor
                  value={selectedProject.cssContent}
                  language="css"
                  onChange={value => handleCodeChange('cssContent', value)}
                  title="Styles (CSS)"
                />
              </Panel>
              {showPreview && (
                <PanelResizeHandle className="panel-resize-handle" />
              )}
            </>
          )}

          {showPreview && (
            <Panel defaultSize={showCodeEditors ? 34 : 100} minSize={20}>
              <div className="preview-panel">
                <div className="editor-header">
                  <h3>Live Preview</h3>
                  <span className="language-badge">PREVIEW</span>
                </div>
                <LiveRenderer project={selectedProject} />
              </div>
            </Panel>
          )}
        </PanelGroup>
      </div>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}

// Component for projects list page
function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const initializeProjects = async () => {
      const loadedProjects = await loadProjects();
      setProjects(loadedProjects);
    };

    initializeProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      saveProjects();
    }
  }, [projects]);

  const handleSelectProject = (project: Project) => {
    navigate(`/${project.id}`);
  };

  const handleCreateProject = async (name: string, type: 'tsx' | 'jsx') => {
    try {
      const newProject = await createNewProject(name, type);
      const updatedProjects = await loadProjects(); // Reload from registry
      setProjects(updatedProjects);
      navigate(`/${newProject.id}`);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : 'Failed to create project'
      );
    }
  };

  const handleDeleteProject = async (projectId: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId);
        // Update local state after successful deletion
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (error) {
        alert(
          error instanceof Error ? error.message : 'Failed to delete project'
        );
      }
    }
  };

  return (
    <div className="main-content">
      <div className="header">
        <h1>Frontend Challenges</h1>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          New Project
        </button>
      </div>

      <ProjectTable
        projects={projects}
        selectedProject={null}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
      />

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
}

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/:folderName" element={<ProjectDetails />} />
      </Routes>
    </div>
  );
}
