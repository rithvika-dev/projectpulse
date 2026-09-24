import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { projectService } from '../../services/projectService';
import { useToast } from '../../context/ToastContext';
import { FolderPlus } from 'lucide-react';

export const CreateProjectModal = ({
  isOpen,
  onClose,
  onProjectCreated,
  users = [],
  teams = [],
}) => {
  const { error } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    projectCode: '',
    description: '',
    projectManager: '',
    team: '',
    status: 'Planning',
    priority: 'Medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    budget: '',
    tags: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.projectCode.trim()) {
      error('Project name and uppercase code are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        projectCode: formData.projectCode.trim().toUpperCase(),
        description: formData.description.trim(),
        projectManager: formData.projectManager || undefined,
        team: formData.team || undefined,
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        budget: Number(formData.budget) || 0,
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };

      const res = await projectService.createProject(payload);
      if (res.success) {
        onProjectCreated(res.data);
        onClose();
        setFormData({
          name: '',
          projectCode: '',
          description: '',
          projectManager: '',
          team: '',
          status: 'Planning',
          priority: 'Medium',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          budget: '',
          tags: '',
        });
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      subtitle="Establish a new collaborative delivery initiative"
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
            icon={FolderPlus}
          >
            Create Project
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Input
              label="Project Name"
              placeholder="e.g. Enterprise Cloud Portal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Input
              label="Code"
              placeholder="e.g. PRJ-CP"
              value={formData.projectCode}
              onChange={(e) =>
                setFormData({ ...formData, projectCode: e.target.value.toUpperCase() })
              }
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Objectives, target deliverables, and scope..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="block w-full rounded-lg border border-sand-300 bg-white text-sm text-charcoal-800 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 p-3 shadow-subtle resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Project Manager"
            value={formData.projectManager}
            onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
            placeholder="Select Manager..."
            options={users.map((u) => ({ value: u._id, label: u.name }))}
          />

          <Select
            label="Assigned Team"
            value={formData.team}
            onChange={(e) => setFormData({ ...formData, team: e.target.value })}
            placeholder="Select Team..."
            options={teams.map((t) => ({ value: t._id, label: t.name }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Initial Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'Planning', label: 'Planning' },
              { value: 'Active', label: 'Active' },
              { value: 'On Hold', label: 'On Hold' },
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
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
          />

          <Input
            label="Target Delivery Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Budget ($ USD)"
            type="number"
            placeholder="50000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />

          <Input
            label="Tags (comma separated)"
            placeholder="React, API, Mobile"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
};
