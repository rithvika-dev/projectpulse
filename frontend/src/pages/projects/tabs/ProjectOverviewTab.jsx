import React from 'react';
import { StatCard } from '../../../components/common/StatCard';
import { Badge } from '../../../components/common/Badge';
import { Avatar } from '../../../components/common/Avatar';
import { ProgressBar } from '../../../components/common/ProgressBar';
import {
  CheckSquare,
  AlertCircle,
  Zap,
  Flag,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export const ProjectOverviewTab = ({ project, onNavigateTab }) => {
  const metrics = project?.metrics || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Tasks"
          value={metrics.totalTasks || 0}
          subtitle={`${metrics.doneTasks || 0} completed`}
          icon={CheckSquare}
          variant="forest"
        />
        <StatCard
          title="Progress"
          value={`${metrics.progressPercentage || 0}%`}
          subtitle="Based on task deliverables"
          icon={TrendingUp}
          variant="forest"
        />
        <StatCard
          title="Open Issues"
          value={metrics.openIssues || 0}
          subtitle={`${metrics.criticalIssues || 0} critical/blockers`}
          icon={AlertCircle}
          variant={metrics.criticalIssues > 0 ? 'terracotta' : 'neutral'}
        />
        <StatCard
          title="Milestones"
          value={`${metrics.completedMilestones || 0} / ${metrics.totalMilestones || 0}`}
          subtitle="Key roadmap targets"
          icon={Flag}
          variant="amber"
        />
      </div>

      {/* Main Project Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Description, Active Sprint, Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-sand-200 p-5 shadow-card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">
              Project Scope & Objectives
            </h4>
            <p className="text-sm text-charcoal-700 leading-relaxed">
              {project.description ||
                'No detailed project summary provided. You can update this in settings.'}
            </p>

            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-sand-100">
                {project.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-sand-100 text-sand-700 border border-sand-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Active Sprint Highlights */}
          <div className="bg-white rounded-xl border border-sand-200 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-sand-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-forest-600" />
                Active Sprint
              </h4>
              <button
                onClick={() => onNavigateTab('sprints')}
                className="text-xs font-semibold text-forest-600 hover:text-forest-700"
              >
                Sprint Details →
              </button>
            </div>

            {metrics.activeSprint ? (
              <div className="bg-sand-50 p-4 rounded-xl border border-sand-200">
                <div className="flex items-center justify-between mb-1.5">
                  <h5 className="text-sm font-bold text-charcoal-900">
                    {metrics.activeSprint.name}
                  </h5>
                  <Badge variant="active" size="xs">
                    In Flight
                  </Badge>
                </div>
                {metrics.activeSprint.goal && (
                  <p className="text-xs text-charcoal-700 italic mb-3">
                    "{metrics.activeSprint.goal}"
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-sand-500 pt-2 border-t border-sand-200">
                  <span>
                    Ends {new Date(metrics.activeSprint.endDate).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onNavigateTab('tasks')}
                    className="font-semibold text-forest-600 hover:underline"
                  >
                    Go to Kanban Board
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-sand-500 italic py-2">
                No active sprint in flight. Go to the Sprints tab to launch a planned sprint.
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Project Metadata Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-sand-200 p-5 shadow-card space-y-4 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 pb-2 border-b border-sand-100">
              Initiative Metadata
            </h4>

            <div>
              <span className="text-sand-500 block mb-1">Project Manager</span>
              {project.projectManager ? (
                <div className="flex items-center gap-2">
                  <Avatar
                    src={project.projectManager.avatar}
                    name={project.projectManager.name}
                    size="sm"
                  />
                  <div>
                    <span className="font-semibold text-charcoal-900 block">
                      {project.projectManager.name}
                    </span>
                    <span className="text-[10px] text-sand-500">
                      {project.projectManager.email}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-sand-400 italic">Unassigned</span>
              )}
            </div>

            <div>
              <span className="text-sand-500 block mb-1">Team Association</span>
              <span className="font-semibold text-charcoal-800">
                {project.team?.name || 'General Product Pod'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-sand-500 block mb-0.5">Start Date</span>
                <span className="font-semibold text-charcoal-800">
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-sand-500 block mb-0.5">Target Delivery</span>
                <span className="font-semibold text-charcoal-800">
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>

            {project.budget > 0 && (
              <div>
                <span className="text-sand-500 block mb-0.5">Allocated Budget</span>
                <span className="font-semibold text-charcoal-900">
                  ${project.budget.toLocaleString()} USD
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
