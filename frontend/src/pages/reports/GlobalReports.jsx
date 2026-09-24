import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { projectService } from '../../services/projectService';
import { StatCard } from '../../components/common/StatCard';
import { Select } from '../../components/common/Select';
import { LoadingState } from '../../components/common/LoadingState';
import { TaskDistributionChart } from '../../components/charts/TaskDistributionChart';
import { IssueSeverityChart } from '../../components/charts/IssueSeverityChart';
import { WorkloadChart } from '../../components/charts/WorkloadChart';
import { BarChart3, FolderKanban, CheckSquare, Zap, AlertCircle } from 'lucide-react';

export const GlobalReports = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectReport, setProjectReport] = useState(null);
  const [workloadReport, setWorkloadReport] = useState([]);
  const [overviewStats, setOverviewStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initReports = async () => {
      setLoading(true);
      try {
        const [projRes, overviewRes] = await Promise.all([
          projectService.getProjects(),
          reportService.getOrgOverview(),
        ]);

        if (projRes.success && projRes.data?.length > 0) {
          setProjects(projRes.data);
          setSelectedProjectId(projRes.data[0]._id);
        }
        if (overviewRes.success) {
          setOverviewStats(overviewRes.data?.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initReports();
  }, []);

  useEffect(() => {
    const loadSelectedProjectReport = async () => {
      if (!selectedProjectId) return;
      try {
        const [repRes, workRes] = await Promise.all([
          reportService.getProjectReport(selectedProjectId),
          reportService.getWorkloadReport(selectedProjectId),
        ]);

        if (repRes.success) setProjectReport(repRes.data);
        if (workRes.success) setWorkloadReport(workRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadSelectedProjectReport();
  }, [selectedProjectId]);

  if (loading) {
    return <LoadingState message="Aggregating workspace analytics & metrics..." />;
  }

  const summary = projectReport?.summary || {};
  const charts = projectReport?.charts || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand-200">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-forest-600" />
            Executive Reports & Agile Metrics
          </h2>
          <p className="text-xs text-sand-600 mt-0.5">
            Deliverable throughput, velocity breakdown, defect trends, and cross-functional team capacity
          </p>
        </div>

        {/* Project Selector for deep-dive */}
        <div className="w-64">
          <Select
            label="Filter Project Deep-Dive"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            options={projects.map((p) => ({ value: p._id, label: p.name }))}
          />
        </div>
      </div>

      {/* Top Organization Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Organization Initiatives"
          value={overviewStats?.totalProjects || 0}
          subtitle={`${overviewStats?.activeProjects || 0} active in sprint`}
          icon={FolderKanban}
          variant="forest"
        />
        <StatCard
          title="Overall Task Completion"
          value={`${overviewStats?.taskCompletionRate || 0}%`}
          subtitle={`${overviewStats?.doneTasks || 0} / ${overviewStats?.totalTasks || 0} done`}
          icon={CheckSquare}
          variant="forest"
        />
        <StatCard
          title="Open Defects & Bugs"
          value={overviewStats?.openIssues || 0}
          subtitle="Across all workspace teams"
          icon={AlertCircle}
          variant={overviewStats?.openIssues > 5 ? 'terracotta' : 'neutral'}
        />
        <StatCard
          title="Active Story Points"
          value={`${summary.completedStoryPoints || 0} / ${summary.totalStoryPoints || 0} pts`}
          subtitle="Selected project velocity"
          icon={Zap}
          variant="amber"
        />
      </div>

      {/* Project Deep-Dive Charts */}
      {projectReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Breakdown */}
            <div className="bg-white rounded-2xl border border-sand-200 p-5 shadow-card">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">
                Deliverables by Kanban Status ({projectReport.project?.name})
              </h4>
              <p className="text-xs text-sand-500 mb-4">Pipeline distribution from Backlog to Done</p>
              <TaskDistributionChart data={charts.taskStatusData || []} />
            </div>

            {/* Issue Severity Breakdown */}
            <div className="bg-white rounded-2xl border border-sand-200 p-5 shadow-card">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">
                Defect Severity & Risk ({projectReport.project?.name})
              </h4>
              <p className="text-xs text-sand-500 mb-4">Open bugs classified by severity level</p>
              <IssueSeverityChart data={charts.issueSeverityData || []} />
            </div>
          </div>

          {/* Team Workload Breakdown */}
          {workloadReport.length > 0 && (
            <div className="bg-white rounded-2xl border border-sand-200 p-5 shadow-card">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 mb-2">
                Team Workload & Capacity Load ({projectReport.project?.name})
              </h4>
              <p className="text-xs text-sand-500 mb-4">Assigned tasks and story points per member</p>
              <WorkloadChart data={workloadReport} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
