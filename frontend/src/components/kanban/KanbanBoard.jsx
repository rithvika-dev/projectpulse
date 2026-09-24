import React, { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { taskService } from '../../services/taskService';
import { useToast } from '../../context/ToastContext';
import { TaskDetailModal } from './TaskDetailModal';
import { CreateTaskModal } from './CreateTaskModal';

const COLUMNS = [
  { id: 'Backlog', title: 'Backlog' },
  { id: 'To Do', title: 'To Do' },
  { id: 'In Progress', title: 'In Progress' },
  { id: 'Review', title: 'Review' },
  { id: 'Done', title: 'Done' },
];

export const KanbanBoard = ({
  tasks = [],
  projectId,
  sprintId,
  onTasksUpdated,
  members = [],
}) => {
  const { success, error } = useToast();
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createInitialStatus, setCreateInitialStatus] = useState('To Do');

  const handleDropTask = async (taskId, newStatus) => {
    const taskToMove = tasks.find((t) => t._id === taskId);
    if (!taskToMove || taskToMove.status === newStatus) return;

    // Optimistically update parent state
    const updatedTasks = tasks.map((t) =>
      t._id === taskId ? { ...t, status: newStatus } : t
    );
    if (onTasksUpdated) onTasksUpdated(updatedTasks);

    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      success(`Task moved to ${newStatus}`);
    } catch (err) {
      error('Failed to move task. Reverting changes.');
      // Revert if error
      if (onTasksUpdated) onTasksUpdated(tasks);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  const handleAddTask = (status) => {
    setCreateInitialStatus(status);
    setIsCreateOpen(true);
  };

  const handleTaskCreated = (newTask) => {
    setIsCreateOpen(false);
    if (onTasksUpdated) {
      onTasksUpdated([newTask, ...tasks]);
    }
    success(`Task "${newTask.title}" created successfully`);
  };

  const handleTaskUpdated = (updatedTask) => {
    setSelectedTask(updatedTask);
    if (onTasksUpdated) {
      onTasksUpdated(tasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    }
    success('Task details updated');
  };

  const handleTaskDeleted = (taskId) => {
    setIsDetailOpen(false);
    setSelectedTask(null);
    if (onTasksUpdated) {
      onTasksUpdated(tasks.filter((t) => t._id !== taskId));
    }
    success('Task removed');
  };

  return (
    <div className="w-full">
      {/* 5 Column Responsive Kanban Board */}
      <div className="flex gap-4 overflow-x-auto kanban-scroll pb-6 pt-1 items-start">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              status={col.id}
              title={col.title}
              tasks={colTasks}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
              onDropTask={handleDropTask}
              draggingTaskId={draggingTaskId}
              setDraggingTaskId={setDraggingTaskId}
            />
          );
        })}
      </div>

      {/* Task Details Drawer/Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          task={selectedTask}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
          members={members}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={projectId}
        sprintId={sprintId}
        initialStatus={createInitialStatus}
        onTaskCreated={handleTaskCreated}
        members={members}
      />
    </div>
  );
};
