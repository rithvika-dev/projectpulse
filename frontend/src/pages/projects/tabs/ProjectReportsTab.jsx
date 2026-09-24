import React, { useState, useEffect } from 'react';
import { reportService } from '../../../services/reportService';
import { StatCard } from '../../../components/common/StatCard';
import { LoadingState } from '../../../components/common/LoadingState';
import { TaskDistributionChart } from '../../../components/charts/TaskDistributionChart';
import { IssueSeverityChart } from '../../../components/charts/IssueSeverityChart';
import { CheckSquare, AlertCircle, TrendingUp, Award, Zap } from 'lucide-react';

export const ProjectReportsTab = ({ project }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await reportService.getProjectReport(project._id);
        if (res.success) {
          setReport(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (project?._id) fetchReport();
  }, [project?._id]);

  if (loading) {
    return <LoadingState message="Generating project velocity & quality report..." />;
  }

  const summary = report?.summary || {};
  const charts = report?.charts || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Deliverables Done"
          value={`${summary.completedTasks || 0} / ${summary.totalTasks || 0}`}
          subtitle={`${summary.pendingTasks || 0} items remaining`}
          icon={CheckSquare}
          variant="forest"
        />
        <StatCard
          title="Story Points Velocity"
          value={`${summary.completedStoryPoints || 0} pts`}
          subtitle={`Out of ${summary.totalStoryPoints || 0} total committed`}
          icon={TrendingUp}
          variant="forest"
        />
        <StatCard
          title="Open Defects"
          value={summary.openIssues || 0}
          subtitle={`${summary.criticalIssues || 0} critical/blockers`}
          icon={AlertCircle}
          variant={summary.criticalIssues > 0 ? 'terracotta' : 'neutral'}
        />
        <StatCard
          title="Milestone Milestones"
          value={`${summary.completedMilestones || 0} / ${summary.totalMilestones || 0}`}
          subtitle={`${summary.delayedMilestones || 0} delayed`}
          icon={Award}
          variant="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status Distribution */}
        <div className="bg-white rounded-2xl border border-sand-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-sand-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
              Deliverables Status Distribution
            </h4>
            <span className="text-xs text-sand-500">Backlog to Done</span>
          </div>
          <TaskDistributionChart data={charts.taskStatusData || []} />
        </div>

        {/* Issue Severity Breakdown */}
        <div className="bg-white rounded-2xl border border-sand-200 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-sand-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900">
              Issue Severity Breakdown
            </h4>
            <span className="text-xs text-sand-500">Quality & Stability</span>
          </div>
          <IssueSeverityChart data={charts.issueSeverityData || []} />
        </div>
      </div>
    </div>
  );
};
