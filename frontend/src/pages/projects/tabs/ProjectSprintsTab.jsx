import React, { useState, useEffect } from 'react';
import { sprintService } from '../../../services/sprintService';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { Modal } from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { EmptyState } from '../../../components/common/EmptyState';
import { LoadingState } from '../../../components/common/LoadingState';
import { ProgressBar } from '../../../components/common/ProgressBar';
import {
  Zap,
  Play,
  CheckCircle,
  Plus,
  Clock,
  Trash2,
  ListTodo,
} from 'lucide-react';

export const ProjectSprintsTab = ({ project, onSelectSprintForBoard }) => {
  const { isPM, isTeamLead } = useAuth();
  const { success, error } = useToast();

  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSprints = async () => {
    setLoading(true);
    try {
      const res = await sprintService.getSprints({ project: project._id });
      if (res.success) {
        setSprints(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (project?._id) fetchSprints();
  }, [project?._id]);

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await sprintService.createSprint({
        ...formData,
        project: project._id,
      });
      if (res.success) {
        setSprints([res.data, ...sprints]);
        setIsCreateOpen(false);
        setFormData({
          name: '',
          goal: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        });
        success('Sprint created successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create sprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      const res = await sprintService.startSprint(sprintId);
      if (res.success) {
        fetchSprints();
        success(res.message || 'Sprint started');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to start sprint');
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    if (window.confirm('Complete this sprint iteration? Incomplete items can be moved to backlog.')) {
      try {
        const res = await sprintService.completeSprint(sprintId, true);
        if (res.success) {
          fetchSprints();
          success('Sprint completed successfully');
        }
      } catch (err) {
        error('Failed to complete sprint');
      }
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    if (window.confirm('Are you sure you want to delete this sprint?')) {
      try {
        await sprintService.deleteSprint(sprintId);
        setSprints(sprints.filter((s) => s._id !== sprintId));
        success('Sprint deleted');
      } catch (err) {
        error('Failed to delete sprint');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-charcoal-900">Sprint Iteration Cycles</h3>
          <p className="text-xs text-sand-600">
            Time-boxed agile iterations for your engineering deliverable commitments
          </p>
        </div>

        {(isPM || isTeamLead) && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={Plus}
          >
            Create Sprint
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Loading sprints..." />
      ) : sprints.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No Sprints Planned"
          description="Create your first 2-week agile sprint to organize backlog items and track story point velocity."
          actionLabel={isPM || isTeamLead ? 'Plan Sprint 1' : undefined}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {sprints.map((sprint) => {
            const isActive = sprint.status === 'Active';
            const isCompleted = sprint.status === 'Completed';

            return (
              <div
                key={sprint._id}
                className={`bg-white rounded-2xl border p-5 shadow-card transition-all ${
                  isActive
                    ? 'border-forest-400 ring-2 ring-forest-100'
                    : 'border-sand-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sand-100">
                  <div>
                    <div className="flex items-center gap-2.5 mb-1">
                      <h4 className="text-base font-bold text-charcoal-900">
                        {sprint.name}
                      </h4>
                      <Badge variant={sprint.status} size="sm">
                        {sprint.status}
                      </Badge>
                    </div>
                    {sprint.goal && (
                      <p className="text-xs text-charcoal-700 italic">
                        "{sprint.goal}"
                      </p>
                    )}
                  </div>

                  {/* Actions based on status and role */}
                  <div className="flex items-center gap-2">
                    {isActive && (isPM || isTeamLead) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCompleteSprint(sprint._id)}
                        icon={CheckCircle}
                      >
                        Complete Sprint
                      </Button>
                    )}

                    {!isActive && !isCompleted && (isPM || isTeamLead) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartSprint(sprint._id)}
                        icon={Play}
                      >
                        Start Sprint
                      </Button>
                    )}

                    {(isPM || isTeamLead) && !isActive && (
                      <button
                        onClick={() => handleDeleteSprint(sprint._id)}
                        className="p-2 rounded-lg text-sand-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete sprint"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sprint Metrics Bar */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-sand-500 block mb-0.5">Timeline</span>
                    <span className="font-semibold text-charcoal-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sand-500" />
                      {new Date(sprint.startDate).toLocaleDateString()} –{' '}
                      {new Date(sprint.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-sand-500 block mb-0.5">Deliverables</span>
                    <span className="font-semibold text-charcoal-800">
                      {sprint.totalTasks || 0} tasks ({sprint.doneTasks || 0} Done)
                    </span>
                  </div>

                  <div>
                    <span className="text-sand-500 block mb-0.5">Story Points</span>
                    <span className="font-semibold text-charcoal-800">
                      {sprint.completedPoints || 0} / {sprint.totalPoints || 0} pts
                    </span>
                  </div>

                  <div className="flex flex-col justify-center">
                    <ProgressBar
                      value={sprint.progressPercentage || 0}
                      size="sm"
                      variant="auto"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Sprint Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Plan New Sprint"
        subtitle="Set milestone duration, schedule dates, and team commitment goal"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateSprint}
              isLoading={isSubmitting}
              icon={Plus}
            >
              Create Sprint
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <Input
            label="Sprint Name"
            placeholder="e.g. Sprint 3: Database & Auth"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Sprint Goal
            </label>
            <textarea
              rows={2}
              placeholder="What is the primary deliverable or outcome?"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              className="block w-full rounded-lg border border-sand-300 bg-white text-sm text-charcoal-800 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 p-2.5 shadow-subtle resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
