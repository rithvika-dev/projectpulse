import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import { taskService } from '../../services/taskService';
import { activityService } from '../../services/activityService';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { Button } from '../../components/common/Button';
import { LoadingState } from '../../components/common/LoadingState';
import {
  FolderKanban,
  CheckSquare,
  Users,
  AlertCircle,
  Zap,
  Flag,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, isAdmin, isPM, isTeamLead, isDev, isStakeholder } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const [overviewRes, tasksRes, activityRes] = await Promise.all([
          reportService.getOrgOverview(),
          taskService.getTasks({ myTasks: 'true', limit: 5 }),
          activityService.getActivities({ limit: 6 }),
        ]);

        if (overviewRes.success) setOverview(overviewRes.data);
        if (tasksRes.success) setMyTasks(tasksRes.data || []);
        if (activityRes.success) setActivities(activityRes.data || []);
      } catch (err) {
        console.error('[Dashboard Error]', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading your agile workspace overview..." />;
  }

  const stats = overview?.stats || {
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalMembers: 0,
    totalTasks: 0,
    doneTasks: 0,
    openIssues: 0,
    taskCompletionRate: 0,
  };

  const getRoleHeaderSubtitle = () => {
    if (isAdmin) return 'Organization executive view · Monitoring cross-project velocity & team capacities';
    if (isPM) return 'Project management view · Tracking active milestones, sprint cadences, and open blockers';
    if (isTeamLead) return 'Engineering lead view · Managing code reviews, sprint tasks, and workload distribution';
    if (isDev) return 'Developer workbench · Assigned sprint items, active tasks, and recent reviews';
    return 'Stakeholder dashboard · High-level milestone progression, delivery schedules, and project health';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
              Welcome, {user?.name || 'Team Member'}
            </h2>
            <Badge variant="forest" size="sm">
              {user?.role?.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <p className="text-xs text-sand-600 max-w-2xl">{getRoleHeaderSubtitle()}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/projects')}
            icon={FolderKanban}
          >
            All Projects
          </Button>
          {(isAdmin || isPM) && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/projects')}
              icon={Plus}
            >
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Top Stat Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          subtitle={`${stats.activeProjects} currently active`}
          icon={FolderKanban}
          variant="forest"
        />
        <StatCard
          title="Deliverable Completion"
          value={`${stats.taskCompletionRate}%`}
          subtitle={`${stats.doneTasks} of ${stats.totalTasks} tasks done`}
          icon={CheckSquare}
          variant="forest"
          trend={{ positive: true, value: '↑' }}
        />
        <StatCard
          title="Open Issues"
          value={stats.openIssues}
          subtitle="Across active initiatives"
          icon={AlertCircle}
          variant={stats.openIssues > 5 ? 'terracotta' : 'neutral'}
        />
        <StatCard
          title="Active Team Members"
          value={stats.totalMembers}
          subtitle="In NovaWorks workspace"
          icon={Users}
          variant="amber"
        />
      </div>

      {/* Second Section: Active Sprints & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Sprints */}
        <div className="bg-white rounded-xl border border-sand-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-sand-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-forest-50 text-forest-600 border border-forest-100">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
                Active Sprints
              </h4>
            </div>
            <NavLink
              to="/projects"
              className="text-xs text-forest-600 hover:text-forest-700 font-semibold inline-flex items-center gap-1"
            >
              View Boards <ArrowRight className="w-3 h-3" />
            </NavLink>
          </div>

          {overview?.activeSprints && overview.activeSprints.length > 0 ? (
            <div className="space-y-3">
              {overview.activeSprints.map((sprint) => (
                <div
                  key={sprint._id}
                  onClick={() => navigate(`/projects/${sprint.project?._id}/sprints`)}
                  className="p-3.5 rounded-xl bg-sand-50/70 border border-sand-200 hover:border-forest-300 hover:bg-forest-50/20 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-charcoal-900">
                      {sprint.name}
                    </span>
                    <Badge variant="active" size="xs">
                      Active Sprint
                    </Badge>
                  </div>
                  <p className="text-xs text-sand-600 line-clamp-1 mb-2">
                    {sprint.goal || 'No specific goal set'}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-sand-500 pt-1.5 border-t border-sand-200/60">
                    <span className="font-medium text-forest-700">
                      {sprint.project?.name} [{sprint.project?.projectCode}]
                    </span>
                    <span>
                      Ends {new Date(sprint.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-sand-500 italic">
              No active sprints running. Start a sprint from any project board.
            </div>
          )}
        </div>

        {/* Upcoming Milestones */}
        <div className="bg-white rounded-xl border border-sand-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-sand-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-terracotta-50 text-terracotta-600 border border-terracotta-100">
                <Flag className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
                Upcoming Milestones
              </h4>
            </div>
            <NavLink
              to="/projects"
              className="text-xs text-forest-600 hover:text-forest-700 font-semibold inline-flex items-center gap-1"
            >
              Roadmap <ArrowRight className="w-3 h-3" />
            </NavLink>
          </div>

          {overview?.upcomingMilestones && overview.upcomingMilestones.length > 0 ? (
            <div className="space-y-3">
              {overview.upcomingMilestones.map((m) => (
                <div
                  key={m._id}
                  onClick={() => navigate(`/projects/${m.project?._id}/milestones`)}
                  className="p-3.5 rounded-xl bg-sand-50/70 border border-sand-200 hover:border-sand-300 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-charcoal-900">{m.title}</span>
                    <Badge variant={m.status} size="xs">
                      {m.status}
                    </Badge>
                  </div>
                  <div className="w-full bg-sand-200 rounded-full h-1.5 my-2">
                    <div
                      className="bg-forest-500 h-1.5 rounded-full"
                      style={{ width: `${m.progress || 0}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-sand-500">
                    <span className="font-medium text-charcoal-700">
                      {m.project?.name}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-terracotta-600">
                      <Clock className="w-3 h-3" />
                      Due {new Date(m.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-sand-500 italic">
              No pending milestone deadlines approaching.
            </div>
          )}
        </div>
      </div>

      {/* Third Section: My Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-sand-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-sand-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-forest-50 text-forest-600 border border-forest-100">
                <CheckSquare className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
                My Assigned Deliverables
              </h4>
            </div>
            <NavLink
              to="/tasks"
              className="text-xs text-forest-600 hover:text-forest-700 font-semibold inline-flex items-center gap-1"
            >
              View All ({myTasks.length}) <ArrowRight className="w-3 h-3" />
            </NavLink>
          </div>

          {myTasks.length > 0 ? (
            <div className="divide-y divide-sand-100">
              {myTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => navigate(`/projects/${task.project?._id}/tasks`)}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-sand-50/60 px-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold font-mono text-sand-500">
                        {task.taskCode}
                      </span>
                      <p className="text-xs font-bold text-charcoal-900 truncate">
                        {task.title}
                      </p>
                    </div>
                    <p className="text-[11px] text-sand-500 truncate">
                      {task.project?.name} · {task.storyPoints || 0} pts
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge size="xs" variant={task.priority}>
                      {task.priority}
                    </Badge>
                    <Badge size="xs" variant={task.status}>
                      {task.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-xs text-sand-500 italic">
              You have no pending tasks assigned at this moment.
            </div>
          )}
        </div>

        {/* Recent Activity Feed (1 Col) */}
        <div className="bg-white rounded-xl border border-sand-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-sand-100">
            <h4 className="text-sm font-bold text-charcoal-900 uppercase tracking-wider">
              Activity Stream
            </h4>
            <NavLink
              to="/activity"
              className="text-xs text-forest-600 hover:text-forest-700 font-semibold inline-flex items-center gap-1"
            >
              Full log <ArrowRight className="w-3 h-3" />
            </NavLink>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {activities.map((act) => (
              <div key={act._id} className="flex items-start gap-2.5 text-xs">
                <Avatar
                  src={act.actor?.avatar}
                  name={act.actor?.name || 'User'}
                  size="xs"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-charcoal-800 leading-snug">
                    <span className="font-semibold text-charcoal-900">
                      {act.actor?.name}
                    </span>{' '}
                    {act.description?.replace(act.actor?.name, '')}
                  </p>
                  <span className="text-[10px] text-sand-400 mt-0.5 block">
                    {new Date(act.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
