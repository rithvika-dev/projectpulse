import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { taskService } from '../../services/taskService';
import { useToast } from '../../context/ToastContext';
import { Plus } from 'lucide-react';

export const CreateTaskModal = ({
  isOpen,
  onClose,
  projectId,
  sprintId,
  initialStatus = 'Backlog',
  onTaskCreated,
  members = [],
}) => {
  const { error } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'Medium',
    assignee: '',
    storyPoints: 1,
    dueDate: '',
    labels: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial status if changed
  React.useEffect(() => {
    setFormData((prev) => ({ ...prev, status: initialStatus }));
  }, [initialStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      error('Task title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        project: projectId,
        sprint: sprintId || undefined,
        status: formData.status,
        priority: formData.priority,
        assignee: formData.assignee || undefined,
        storyPoints: Number(formData.storyPoints) || 1,
        dueDate: formData.dueDate || undefined,
        labels: formData.labels
          ? formData.labels.split(',').map((l) => l.trim()).filter(Boolean)
          : [],
      };

      const res = await taskService.createTask(payload);
      if (res.success) {
        onTaskCreated(res.data);
        // Reset form
        setFormData({
          title: '',
          description: '',
          status: 'Backlog',
          priority: 'Medium',
          assignee: '',
          storyPoints: 1,
          dueDate: '',
          labels: '',
        });
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      subtitle="Add a new deliverable or user story to your project board"
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            icon={Plus}
          >
            Create Task
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. Implement OAuth2 Refresh Token Flow"
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
            placeholder="Context, user stories, acceptance criteria..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="block w-full rounded-lg border border-sand-300 bg-white text-sm text-charcoal-800 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 p-3 shadow-subtle resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Column / Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'Backlog', label: 'Backlog' },
              { value: 'To Do', label: 'To Do' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'Review', label: 'Review' },
              { value: 'Done', label: 'Done' },
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

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Assignee"
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            placeholder="Assign member..."
            options={members.map((m) => ({
              value: m._id,
              label: m.name,
            }))}
          />

          <Input
            label="Story Points"
            type="number"
            min={0}
            max={100}
            value={formData.storyPoints}
            onChange={(e) => setFormData({ ...formData, storyPoints: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          <Input
            label="Labels"
            placeholder="Backend, Security, UI"
            value={formData.labels}
            onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
};
