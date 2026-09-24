import React, { useState } from 'react';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';

export const KanbanColumn = ({
  status,
  title,
  tasks = [],
  onTaskClick,
  onAddTask,
  onDropTask,
  draggingTaskId,
  setDraggingTaskId,
}) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onDropTask(taskId, status);
    }
  };

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(task._id);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
  };

  // Status header styling
  const statusColors = {
    Backlog: 'bg-sand-400',
    'To Do': 'bg-amberGold-500',
    'In Progress': 'bg-forest-500',
    Review: 'bg-terracotta-500',
    Done: 'bg-emerald-600',
  };

  const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col min-w-[290px] w-full max-w-[340px] bg-sand-100/70 rounded-2xl border transition-all p-3 min-h-[600px] ${
        isOver
          ? 'border-forest-500 bg-forest-50/40 ring-2 ring-forest-200'
          : 'border-sand-200'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-1.5 py-1 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              statusColors[status] || 'bg-sand-500'
            }`}
          />
          <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-800">
            {title}
          </h4>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-sand-200 text-charcoal-700 shadow-subtle">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {totalPoints > 0 && (
            <span
              className="text-[11px] font-medium text-sand-600 mr-1"
              title="Total Story Points in this column"
            >
              {totalPoints} pts
            </span>
          )}
          <button
            onClick={() => onAddTask(status)}
            className="p-1 rounded-md text-sand-500 hover:text-charcoal-800 hover:bg-white transition-colors"
            title="Add task in this column"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List Container */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-0.5">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onClick={onTaskClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            isDragging={draggingTaskId === task._id}
          />
        ))}

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-6 border border-dashed border-sand-300 rounded-xl text-center text-xs text-sand-500 font-medium select-none">
            Drop tasks here or click + to add
          </div>
        )}
      </div>
    </div>
  );
};
