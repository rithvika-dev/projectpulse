import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { authService } from '../../services/authService';
import { teamService } from '../../services/teamService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { SearchBar } from '../../components/common/SearchBar';
import { Select } from '../../components/common/Select';
import { ProgressBar } from '../../components/common/ProgressBar';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { CreateProjectModal } from './CreateProjectModal';
import {
  FolderKanban,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  Filter,
} from 'lucide-react';

export const ProjectList = () => {
  const { isAdmin, isPM } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const [projRes, usersRes, teamsRes] = await Promise.all([
        projectService.getProjects({
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        }),
        authService.getUsers(),
        teamService.getTeams(),
      ]);

      if (projRes.success) setProjects(projRes.data || []);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (teamsRes.success) setTeams(teamsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, priorityFilter, search]);

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
    success(`Project "${newProject.name}" created successfully`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand-200">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-forest-600" />
            Projects & Initiatives
          </h2>
          <p className="text-xs text-sand-600 mt-0.5">
            Manage product releases, sprint boards, and cross-functional teams
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-sand-100 p-1 rounded-lg border border-sand-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-charcoal-900 shadow-subtle'
                  : 'text-sand-600 hover:text-charcoal-800'
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-charcoal-900 shadow-subtle'
                  : 'text-sand-600 hover:text-charcoal-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {(isAdmin || isPM) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              icon={Plus}
            >
              Create Project
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-sand-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, code, tag..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Status: All"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Planning', label: 'Planning' },
                { value: 'Active', label: 'Active' },
                { value: 'On Hold', label: 'On Hold' },
                { value: 'Completed', label: 'Completed' },
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              placeholder="Priority: All"
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Start a new Agile deliverable initiative to begin planning sprints and tracking velocity."
          actionLabel={isAdmin || isPM ? 'Create First Project' : undefined}
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="bg-white rounded-2xl border border-sand-200 p-5 shadow-card hover-card cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sand-100 border border-sand-200 text-charcoal-800">
                    {project.projectCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge size="xs" variant={project.priority}>
                      {project.priority}
                    </Badge>
                    <Badge size="xs" variant={project.status}>
                      {project.status}
                    </Badge>
                  </div>
                </div>

                {/* Project Title & Description */}
                <h4 className="text-base font-bold text-charcoal-900 mb-1.5 hover:text-forest-700 transition-colors">
                  {project.name}
                </h4>
                <p className="text-xs text-sand-600 line-clamp-2 leading-relaxed mb-4">
                  {project.description || 'No description provided'}
                </p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-sand-100 text-sand-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Bottom: Progress, Dates, Manager */}
              <div className="pt-3 border-t border-sand-100 space-y-3">
                <ProgressBar
                  value={project.calculatedProgress || project.progress || 0}
                  size="sm"
                  variant="auto"
                />

                <div className="flex items-center justify-between text-xs text-sand-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.members?.length || 1} members</span>
                  </div>

                  {project.projectManager && (
                    <div className="flex items-center gap-1.5">
                      <Avatar
                        src={project.projectManager.avatar}
                        name={project.projectManager.name}
                        size="xs"
                      />
                      <span className="font-medium text-charcoal-700 truncate max-w-[100px]">
                        {project.projectManager.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-xl border border-sand-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 border-b border-sand-200 text-sand-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Code & Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Manager</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {projects.map((project) => (
                  <tr
                    key={project._id}
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="hover:bg-sand-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sand-600">
                          {project.projectCode}
                        </span>
                        <span className="font-semibold text-charcoal-900">
                          {project.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge size="xs" variant={project.status}>
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge size="xs" variant={project.priority}>
                        {project.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      {project.projectManager?.name || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3.5 w-36">
                      <ProgressBar
                        value={project.calculatedProgress || project.progress || 0}
                        size="sm"
                        showLabel={false}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-sand-500">
                      {project.endDate
                        ? new Date(project.endDate).toLocaleDateString()
                        : 'No deadline'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProjectCreated={handleProjectCreated}
        users={users}
        teams={teams}
      />
    </div>
  );
};
