import { FileCode, FileText, X } from 'lucide-react';
import React, { useState } from 'react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (
    name: string,
    type: 'tsx' | 'jsx',
    customId?: number
  ) => void;
}

export default function NewProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: NewProjectModalProps) {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'tsx' | 'jsx'>('tsx');
  const [projectId, setProjectId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      const customId = projectId.trim()
        ? parseInt(projectId.trim())
        : undefined;
      onCreateProject(projectName.trim(), projectType, customId);
      setProjectName('');
      setProjectType('tsx');
      setProjectId('');
      onClose();
    }
  };

  const handleClose = () => {
    setProjectName('');
    setProjectType('tsx');
    setProjectId('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="project-id">Project ID (optional)</label>
            <input
              id="project-id"
              type="number"
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              placeholder="Auto-assign if empty..."
              min="1"
            />
            <small className="form-help">
              Leave empty to auto-assign next available ID
            </small>
          </div>



          <div className="form-group">
            <label htmlFor="project-name">Project Name</label>
            <input
              id="project-name"
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="Enter project name..."
              autoFocus
              required
            />
          </div>

          <div className="form-group">
            <label>Project Type</label>
            <div className="type-selection">
              <label
                className={`type-option ${projectType === 'tsx' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="type"
                  value="tsx"
                  checked={projectType === 'tsx'}
                  onChange={e =>
                    setProjectType(e.target.value as 'tsx' | 'jsx')
                  }
                />
                <FileCode size={20} />
                <div>
                  <strong>TypeScript (.tsx)</strong>
                  <p>
                    Recommended for type safety and better development
                    experience
                  </p>
                </div>
              </label>

              <label
                className={`type-option ${projectType === 'jsx' ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name="type"
                  value="jsx"
                  checked={projectType === 'jsx'}
                  onChange={e =>
                    setProjectType(e.target.value as 'tsx' | 'jsx')
                  }
                />
                <FileText size={20} />
                <div>
                  <strong>JavaScript (.jsx)</strong>
                  <p>Simpler setup, no type checking</p>
                </div>
              </label>
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!projectName.trim()}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
