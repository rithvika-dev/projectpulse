import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { Tabs } from '../../components/common/Tabs';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';

// Tabs
import { ProjectOverviewTab } from './tabs/ProjectOverviewTab';
import { ProjectTasksTab } from './tabs/ProjectTasksTab';
import { ProjectSprintsTab } from './tabs/ProjectSprintsTab';
import { ProjectMilestonesTab } from './tabs/ProjectMilestonesTab';
import { ProjectIssuesTab } from './tabs/ProjectIssuesTab';
import { ProjectTimelineTab } from './tabs/ProjectTimelineTab';
import { ProjectTeamTab } from './tabs/ProjectTeamTab';
import { ProjectReportsTab } from './tabs/ProjectReportsTab';

import {
  FolderKanban,
  CheckSquare,
  Zap,
  Flag,
  AlertCircle,
  Calendar,
  Users,
  BarChart3,
  ArrowLeft,
  Settings,
  Trash2,
} from 'lucide-react';

export const ProjectDetail = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAdmin, isPM } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tab from URL query or default to 'overview'
  const currentTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const res = await projectService.getProjectById(id);
      if (res.success) {
        setProject(res.data);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProjectDetails();
  }, [id]);

  const handleDeleteProject = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete project "${project.name}" and all its deliverables?`
      )
    ) {
      try {
        await projectService.deleteProject(project._id);
        success('Project deleted');
        navigate('/projects');
      } catch (err) {
        error('Failed to delete project');
      }
    }
  };

  if (loading) {
    return <LoadingState message="Loading project workspace..." />;
  }

  if (!project) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Project Not Found"
        description="The requested project initiative does not exist or has been removed."
        actionLabel="Back to Projects"
        onAction={() => navigate('/projects')}
      />
    );
  }

  const tabItems = [
    { id: 'overview', label: 'Overview', icon: FolderKanban },
    {
      id: 'tasks',
      label: 'Kanban Tasks',
      icon: CheckSquare,
      count: project.metrics?.totalTasks,
    },
    { id: 'sprints', label: 'Sprints', icon: Zap },
    {
      id: 'milestones',
      label: 'Milestones',
      icon: Flag,
      count: project.metrics?.totalMilestones,
    },
    {
      id: 'issues',
      label: 'Issues',
      icon: AlertCircle,
      count: project.metrics?.openIssues,
    },
    { id: 'timeline', label: 'Roadmap', icon: Calendar },
    {
      id: 'team',
      label: 'Team & Workload',
      icon: Users,
      count: project.members?.length,
    },
    { id: 'reports', label: 'Velocity & Reports', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Project Top Bar */}
      <div className="bg-white rounded-2xl border border-sand-200 p-6 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/projects')}
              className="p-2 rounded-xl text-sand-500 hover:text-charcoal-900 hover:bg-sand-100 transition-colors"
              title="Back to Projects"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-sand-100 border border-sand-200 text-charcoal-800">
                  {project.projectCode}
                </span>
                <Badge size="xs" variant={project.priority}>
                  {project.priority}
                </Badge>
                <Badge size="xs" variant={project.status}>
                  {project.status}
                </Badge>
              </div>

              <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
                {project.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {project.projectManager && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sand-50 border border-sand-200">
                <Avatar
                  src={project.projectManager.avatar}
                  name={project.projectManager.name}
                  size="xs"
                />
                <div className="text-xs">
                  <span className="text-sand-500 block leading-tight">Manager</span>
                  <span className="font-semibold text-charcoal-800">
                    {project.projectManager.name}
                  </span>
                </div>
              </div>
            )}

            {isAdmin && (
              <button
                onClick={handleDeleteProject}
                className="p-2 rounded-xl text-sand-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 pt-2 border-t border-sand-100">
          <Tabs tabs={tabItems} activeTab={currentTab} onChange={handleTabChange} />
        </div>
      </div>

      {/* Tab Panels */}
      <div>
        {currentTab === 'overview' && (
          <ProjectOverviewTab project={project} onNavigateTab={handleTabChange} />
        )}
        {currentTab === 'tasks' && <ProjectTasksTab project={project} />}
        {currentTab === 'sprints' && <ProjectSprintsTab project={project} />}
        {currentTab === 'milestones' && <ProjectMilestonesTab project={project} />}
        {currentTab === 'issues' && <ProjectIssuesTab project={project} />}
        {currentTab === 'timeline' && <ProjectTimelineTab project={project} />}
        {currentTab === 'team' && (
          <ProjectTeamTab project={project} onProjectUpdated={setProject} />
        )}
        {currentTab === 'reports' && <ProjectReportsTab project={project} />}
      </div>
    </div>
  );
};
