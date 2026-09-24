import React, { useState, useEffect } from 'react';
import { issueService } from '../../services/issueService';
import { projectService } from '../../services/projectService';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Avatar } from '../../components/common/Avatar';
import { SearchBar } from '../../components/common/SearchBar';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import { AlertCircle, Plus, CheckCircle2 } from 'lucide-react';

export const IssuesList = () => {
  const { success, error } = useToast();

  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const [issuesRes, projectsRes] = await Promise.all([
        issueService.getIssues({
          search: search || undefined,
          project: projectFilter !== 'all' ? projectFilter : undefined,
          severity: severityFilter !== 'all' ? severityFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }),
        projectService.getProjects(),
      ]);

      if (issuesRes.success) setIssues(issuesRes.data || []);
      if (projectsRes.success) setProjects(projectsRes.data || []);
    } catch (err) {
      console.error(err);
      error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [search, projectFilter, severityFilter, statusFilter]);

  const handleResolveIssue = async () => {
    if (!selectedIssue) return;
    try {
      const res = await issueService.updateIssue(selectedIssue._id, {
        status: 'Resolved',
        resolution: resolutionNote,
      });
      if (res.success) {
        setIssues(issues.map((i) => (i._id === selectedIssue._id ? res.data : i)));
        setSelectedIssue(null);
        setResolutionNote('');
        success('Issue resolved successfully');
      }
    } catch (err) {
      error('Failed to resolve issue');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand-200">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-terracotta-600" />
            Organization Defect & Issue Tracker
          </h2>
          <p className="text-xs text-sand-600 mt-0.5">
            Centralized triage for bugs, security vulnerabilities, blockers, and regressions
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-terracotta-50 border border-terracotta-200 text-terracotta-800">
          {issues.filter((i) => ['Open', 'In Progress'].includes(i.status)).length} Open Issues
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-sand-200 shadow-subtle flex flex-col lg:flex-row items-center justify-between gap-3">
        <div className="w-full lg:w-72">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search defects by code or summary..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="w-36">
            <Select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              placeholder="Project: All"
              options={[
                { value: 'all', label: 'All Projects' },
                ...projects.map((p) => ({ value: p._id, label: p.name })),
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              placeholder="Severity: All"
              options={[
                { value: 'all', label: 'All Severities' },
                { value: 'Minor', label: 'Minor' },
                { value: 'Major', label: 'Major' },
                { value: 'Critical', label: 'Critical' },
                { value: 'Blocker', label: 'Blocker' },
              ]}
            />
          </div>

          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Status: All"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Open', label: 'Open' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Closed', label: 'Closed' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Issues Table */}
      {loading ? (
        <LoadingState message="Loading issue records..." />
      ) : issues.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No Issues Match Filter"
          description="Try broadening your filter criteria or search query."
        />
      ) : (
        <div className="bg-white rounded-xl border border-sand-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 border-b border-sand-200 text-sand-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Code & Summary</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Reported By</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {issues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-sand-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sand-600">
                          {issue.issueCode}
                        </span>
                        <div>
                          <p className="font-semibold text-charcoal-900">{issue.title}</p>
                          {issue.resolution && (
                            <p className="text-[11px] text-forest-700 italic mt-0.5">
                              Resolution: {issue.resolution}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-forest-700">
                      {issue.project?.name || 'Project'}
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge size="xs" variant={issue.severity}>
                        {issue.severity}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge size="xs" variant={issue.status}>
                        {issue.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5">
                      {issue.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar
                            src={issue.assignee.avatar}
                            name={issue.assignee.name}
                            size="xs"
                          />
                          <span className="font-medium text-charcoal-800">
                            {issue.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sand-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-sand-600">
                      {issue.reporter?.name || 'System'}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {issue.status !== 'Resolved' && issue.status !== 'Closed' && (
                        <button
                          onClick={() => setSelectedIssue(issue)}
                          className="text-xs font-semibold text-forest-600 hover:text-forest-700 bg-forest-50 px-2 py-1 rounded-md border border-forest-200 inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resolve Issue Modal */}
      {selectedIssue && (
        <Modal
          isOpen={!!selectedIssue}
          onClose={() => setSelectedIssue(null)}
          title={`Resolve Defect: ${selectedIssue.issueCode}`}
          maxWidth="max-w-md"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setSelectedIssue(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleResolveIssue}
                icon={CheckCircle2}
              >
                Confirm Resolution
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-xs text-charcoal-700 font-medium">
              Document resolution explanation for engineering audit:
            </p>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Added input validation sanitizer and patch deployed to staging..."
              className="block w-full rounded-lg border border-sand-300 bg-white text-sm text-charcoal-800 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 p-2.5 shadow-subtle resize-none"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
