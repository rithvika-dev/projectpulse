import React, { useState, useEffect } from 'react';
import { issueService } from '../../../services/issueService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Avatar } from '../../../components/common/Avatar';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { AlertCircle, Plus, CheckCircle2, Search, Filter } from 'lucide-react';

export const ProjectIssuesTab = ({ project }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Major',
    priority: 'High',
    assignee: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await issueService.getIssues({
        project: project._id,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        severity: severityFilter !== 'all' ? severityFilter : undefined,
      });
      if (res.success) {
        setIssues(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (project?._id) fetchIssues();
  }, [project?._id, statusFilter, severityFilter]);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await issueService.createIssue({
        ...formData,
        project: project._id,
      });
      if (res.success) {
        setIssues([res.data, ...issues]);
        setIsCreateOpen(false);
        setFormData({
          title: '',
          description: '',
          severity: 'Major',
          priority: 'High',
          assignee: '',
        });
        success('Issue reported successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to report issue');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        success('Issue marked as resolved');
      }
    } catch (err) {
      error('Failed to resolve issue');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-charcoal-900">Issue & Defect Tracking</h3>
          <p className="text-xs text-sand-600">
            Triage blockers, security vulnerabilities, regression bugs, and severity tickets
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          icon={Plus}
        >
          Report Issue
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-sand-200 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
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
        </div>

        <span className="text-xs font-semibold text-sand-600">
          {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'}
        </span>
      </div>

      {/* Issues Table / List */}
      {loading ? (
        <LoadingState message="Loading issue backlog..." />
      ) : issues.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          title="No Issues Reported"
          description="Great job! No open bugs, blockers, or regression tickets found for this project."
          actionLabel="Report Issue"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-xl border border-sand-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 border-b border-sand-200 text-sand-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Code & Summary</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3 text-right">Actions</th>
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

      {/* Create Issue Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Report New Issue / Defect"
        subtitle="Submit a bug report, blocker, or task regression"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCreateIssue}
              isLoading={isSubmitting}
              icon={Plus}
            >
              Submit Issue
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateIssue} className="space-y-4">
          <Input
            label="Issue Summary"
            placeholder="e.g. Memory leak during large CSV export"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Description & Steps to Reproduce
            </label>
            <textarea
              rows={3}
              placeholder="Observed behavior, expected behavior, logs..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-lg border border-sand-300 bg-white text-sm text-charcoal-800 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 p-2.5 shadow-subtle resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Severity"
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              options={[
                { value: 'Minor', label: 'Minor' },
                { value: 'Major', label: 'Major' },
                { value: 'Critical', label: 'Critical' },
                { value: 'Blocker', label: 'Blocker' },
              ]}
            />

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
            />
          </div>

          <Select
            label="Assignee"
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            placeholder="Assign member..."
            options={(project.members || []).map((m) => ({
              value: m._id,
              label: m.name,
            }))}
          />
        </form>
      </Modal>

      {/* Resolve Issue Modal */}
      {selectedIssue && (
        <Modal
          isOpen={!!selectedIssue}
          onClose={() => setSelectedIssue(null)}
          title={`Resolve Issue: ${selectedIssue.issueCode}`}
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
              Provide resolution notes explaining how this issue was fixed or mitigated:
            </p>
            <textarea
              rows={3}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Added caching layer and optimized MongoDB indexes..."
              className="block w-full rounded-lg border border-sand-300 bg-white text-sm text-charcoal-800 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 p-2.5 shadow-subtle resize-none"
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
