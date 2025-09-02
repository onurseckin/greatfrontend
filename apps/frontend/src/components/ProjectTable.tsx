import { Calendar, FileCode, Play, Trash2 } from 'lucide-react';
import type { Project } from '../types/project';

interface ProjectTableProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onDeleteProject: (projectId: number) => void;
}

export default function ProjectTable({
  projects,
  selectedProject,
  onSelectProject,
  onDeleteProject,
}: ProjectTableProps) {
  return (
    <div className="project-table-container">
      <table className="project-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Created</th>
            <th>Last Modified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr
              key={project.id}
              className={selectedProject?.id === project.id ? 'selected' : ''}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectProject(project)}
              title="Click to open project"
            >
              <td className="project-id">{project.id}</td>
              <td className="project-name">
                <FileCode size={16} />
                {project.name}
              </td>
              <td>
                <span className={`type-badge ${project.type}`}>
                  {project.type.toUpperCase()}
                </span>
              </td>
              <td>
                <div className="date-cell">
                  <Calendar size={14} />
                  <div>
                    <div>{project.createdAt.toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {project.createdAt.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="date-cell">
                  <Calendar size={14} />
                  <div>
                    <div>{project.updatedAt.toLocaleDateString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {project.updatedAt.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="actions">
                  <button
                    className="action-btn open-btn"
                    onClick={e => {
                      e.stopPropagation();
                      onSelectProject(project);
                    }}
                    title="Open project"
                  >
                    <Play size={14} />
                    Open
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteProject(project.id);
                    }}
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {projects.length === 0 && (
        <div className="empty-state">
          <FileCode size={48} />
          <p>No projects yet. Create your first project!</p>
        </div>
      )}
    </div>
  );
}
