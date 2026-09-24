import React, { useState, useEffect } from 'react';
import { milestoneService } from '../../../services/milestoneService';
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
import { ProgressBar } from '../../../components/common/ProgressBar';
import { Flag, Plus, Calendar, CheckCircle2, Trash2 } from 'lucide-react';

export const ProjectMilestonesTab = ({ project }) => {
  const { isPM, isTeamLead } = useAuth();
  const { success, error } = useToast();

  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'Not Started',
    progress: 0,
    owner: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const res = await milestoneService.getMilestones({ project: project._id });
      if (res.success) {
        setMilestones(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (project?._id) fetchMilestones();
  }, [project?._id]);

  const handleCreateMilestone = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) return;

    setIsSubmitting(true);
    try {
      const res = await milestoneService.createMilestone({
        ...formData,
        project: project._id,
      });
      if (res.success) {
        setMilestones([...milestones, res.data]);
        setIsCreateOpen(false);
        setFormData({
          title: '',
          description: '',
          dueDate: '',
          status: 'Not Started',
          progress: 0,
          owner: '',
        });
        success('Milestone created');
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create milestone');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (milestoneId, newStatus) => {
    try {
      const progressVal = newStatus === 'Completed' ? 100 : 50;
      const res = await milestoneService.updateMilestone(milestoneId, {
        status: newStatus,
        progress: progressVal,
      });
      if (res.success) {
        setMilestones(milestones.map((m) => (m._id === milestoneId ? res.data : m)));
        success('Milestone updated');
      }
    } catch (err) {
      error('Failed to update milestone');
    }
  };

  const handleDeleteMilestone = async (id) => {
    if (window.confirm('Delete this milestone?')) {
      try {
        await milestoneService.deleteMilestone(id);
        setMilestones(milestones.filter((m) => m._id !== id));
        success('Milestone deleted');
      } catch (err) {
        error('Failed to delete milestone');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-charcoal-900">Project Milestones</h3>
          <p className="text-xs text-sand-600">
            Key product release gates, external audits, and deliverable commitments
          </p>
        </div>

        {(isPM || isTeamLead) && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            icon={Plus}
          >
            Add Milestone
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingState message="Loading milestones..." />
      ) : milestones.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="No Milestones Defined"
          description="Establish strategic target milestones with target deadlines to keep your engineering teams aligned."
          actionLabel={isPM || isTeamLead ? 'Add Milestone' : undefined}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {milestones.map((milestone) => (
            <div
              key={milestone._id}
              className="bg-white rounded-2xl border border-sand-200 p-5 shadow-card flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold text-charcoal-900 leading-snug">
                    {milestone.title}
                  </h4>
                  <Badge variant={milestone.status} size="xs">
                    {milestone.status}
                  </Badge>
                </div>

                {milestone.description && (
                  <p className="text-xs text-sand-600 mb-4 leading-relaxed line-clamp-3">
                    {milestone.description}
                  </p>
                )}

                <div className="mb-4">
                  <ProgressBar
                    value={milestone.progress || 0}
                    size="sm"
                    variant={milestone.status === 'Completed' ? 'forest' : 'amber'}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-sand-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {milestone.owner && (
                    <div className="flex items-center gap-1.5">
                      <Avatar
                        src={milestone.owner.avatar}
                        name={milestone.owner.name}
                        size="xs"
                      />
                      <span className="font-medium text-charcoal-700 truncate max-w-[100px]">
                        {milestone.owner.name}
                      </span>
                    </div>
                  )}
                  <span className="text-sand-500 font-medium">
                    · Due {new Date(milestone.dueDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {milestone.status !== 'Completed' && (isPM || isTeamLead) && (
                    <button
                      onClick={() => handleUpdateStatus(milestone._id, 'Completed')}
                      className="text-xs font-semibold text-forest-600 hover:text-forest-700 bg-forest-50 px-2 py-1 rounded-md border border-forest-200"
                    >
                      Mark Complete
                    </button>
                  )}
                  {(isPM || isTeamLead) && (
                    <button
                      onClick={() => handleDeleteMilestone(milestone._id)}
                      className="p-1 rounded text-sand-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Milestone Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Project Milestone"
        subtitle="Set milestone goals, due date, and ownership"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateMilestone}
              isLoading={isSubmitting}
              icon={Plus}
            >
              Save Milestone
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateMilestone} className="space-y-4">
          <Input
            label="Milestone Title"
            placeholder="e.g. SOC2 Certification & Audit"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Key criteria for reaching this milestone..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="block w-full rounded-lg border border-sand-300 bg-white text-sm text-charcoal-800 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 p-2.5 shadow-subtle resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />

            <Select
              label="Lead Owner"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              placeholder="Assign Owner..."
              options={(project.members || []).map((m) => ({
                value: m._id,
                label: m.name,
              }))}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
