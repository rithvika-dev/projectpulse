import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../../services/taskService';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { SearchBar } from '../../components/common/SearchBar';
import { Select } from '../../components/common/Select';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingState } from '../../components/common/LoadingState';
import {
  CheckSquare,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';

export const MyTasks = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const res = await taskService.getTasks({
        myTasks: 'true',
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      });
      if (res.success) {
        setTasks(res.data || []);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [search, statusFilter, priorityFilter]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await taskService.updateTaskStatus(taskId, newStatus);
      if (res.success) {
        setTasks(tasks.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
        success(`Task marked as ${newStatus}`);
      }
    } catch (err) {
      error('Failed to update task status');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-sand-200">
        <div>
          <h2 className="text-2xl font-extrabold text-charcoal-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-forest-600" />
            My Deliverables & Assigned Work
          </h2>
          <p className="text-xs text-sand-600 mt-0.5">
            Consolidated task items assigned to you across all projects and sprints
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-forest-50 border border-forest-200 text-forest-800">
          {tasks.filter((t) => t.status !== 'Done').length} Pending Deliverables
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-sand-200 shadow-subtle flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by title, code, label..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              placeholder="Status: All"
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Backlog', label: 'Backlog' },
                { value: 'To Do', label: 'To Do' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Review', label: 'Review' },
                { value: 'Done', label: 'Done' },
              ]}
            />
          </div>

          <div className="w-36">
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

      {/* Tasks Table */}
      {loading ? (
        <LoadingState message="Loading your deliverables..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No Tasks Assigned"
          description="You currently have no deliverable items assigned to you matching the filter criteria."
        />
      ) : (
        <div className="bg-white rounded-xl border border-sand-200 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sand-50 border-b border-sand-200 text-sand-600 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Code & Task Summary</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Story Points</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Quick Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-100">
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="hover:bg-sand-50/70 transition-colors"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sand-600">
                          {task.taskCode}
                        </span>
                        <div>
                          <p className="font-semibold text-charcoal-900">{task.title}</p>
                          {task.labels && task.labels.length > 0 && (
                            <div className="flex gap-1 mt-0.5">
                              {task.labels.map((l, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] text-sand-600 bg-sand-100 px-1.5 py-0.2 rounded"
                                >
                                  {l}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        onClick={() => navigate(`/projects/${task.project?._id}/tasks`)}
                        className="font-medium text-forest-700 hover:underline cursor-pointer"
                      >
                        {task.project?.name}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge size="xs" variant={task.priority}>
                        {task.priority}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5">
                      <Badge size="xs" variant={task.status}>
                        {task.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-charcoal-800">
                      {task.storyPoints || 0} pts
                    </td>

                    <td className="px-4 py-3.5 text-sand-600">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : 'No deadline'}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="text-xs bg-sand-50 border border-sand-300 rounded-md px-2 py-1 text-charcoal-800 focus:outline-none focus:border-forest-500 font-medium"
                      >
                        <option value="Backlog">Backlog</option>
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Review">Review</option>
                        <option value="Done">Done</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
