import React, { useState, useEffect } from 'react';
import { KanbanBoard } from '../../../components/kanban/KanbanBoard';
import { taskService } from '../../../services/taskService';
import { sprintService } from '../../../services/sprintService';
import { SearchBar } from '../../../components/common/SearchBar';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';
import { LoadingState } from '../../../components/common/LoadingState';
import { Plus, Filter, Zap } from 'lucide-react';

export const ProjectTasksTab = ({ project }) => {
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sprintFilter, setSprintFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const [tasksRes, sprintsRes] = await Promise.all([
        taskService.getTasks({
          project: project._id,
          sprint: sprintFilter !== 'all' ? sprintFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          assignee: assigneeFilter !== 'all' ? assigneeFilter : undefined,
          search: search || undefined,
        }),
        sprintService.getSprints({ project: project._id }),
      ]);

      if (tasksRes.success) setTasks(tasksRes.data || []);
      if (sprintsRes.success) setSprints(sprintsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (project?._id) {
      loadTasks();
    }
  }, [project?._id, sprintFilter, priorityFilter, assigneeFilter, search]);

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filter and Search Bar for Kanban */}
      <div className="bg-white p-3 rounded-xl border border-sand-200 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-64">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Filter tasks by name or code..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sprint Filter */}
          <div className="w-36">
            <Select
              value={sprintFilter}
              onChange={(e) => setSprintFilter(e.target.value)}
              placeholder="Sprint: All"
              options={[
                { value: 'all', label: 'All Sprints' },
                ...sprints.map((s) => ({ value: s._id, label: s.name })),
              ]}
            />
          </div>

          {/* Assignee Filter */}
          <div className="w-36">
            <Select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              placeholder="Assignee: All"
              options={[
                { value: 'all', label: 'All Members' },
                { value: 'me', label: 'Assigned to Me' },
                ...(project.members || []).map((m) => ({ value: m._id, label: m.name })),
              ]}
            />
          </div>

          {/* Priority Filter */}
          <div className="w-32">
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              placeholder="Priority: All"
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <LoadingState message="Loading Kanban deliverables..." />
      ) : (
        <KanbanBoard
          tasks={tasks}
          projectId={project._id}
          sprintId={sprintFilter !== 'all' ? sprintFilter : undefined}
          onTasksUpdated={setTasks}
          members={project.members || []}
        />
      )}
    </div>
  );
};
