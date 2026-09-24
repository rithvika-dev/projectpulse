import React from 'react';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { MessageSquare, Paperclip, Calendar, AlertCircle } from 'lucide-react';

export const TaskCard = ({
  task,
  onClick,
  onDragStart,
  onDragEnd,
  isDragging = false,
}) => {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'Done';

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(task)}
      className={`group bg-white rounded-xl border border-sand-200 p-3.5 shadow-subtle hover:shadow-card hover:border-sand-300 transition-all cursor-grab active:cursor-grabbing select-none ${
        isDragging ? 'opacity-40 scale-95 rotate-1 border-forest-400' : ''
      }`}
    >
      {/* Top row: Task code & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-bold text-sand-600 font-mono tracking-wide">
          {task.taskCode || 'TASK'}
        </span>
        <div className="flex items-center gap-1.5">
          {task.storyPoints !== undefined && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sand-100 text-charcoal-700 border border-sand-200"
              title={`${task.storyPoints} Story Points`}
            >
              {task.storyPoints} pts
            </span>
          )}
          <Badge size="xs" variant={task.priority}>
            {task.priority}
          </Badge>
        </div>
      </div>

      {/* Task Title */}
      <h5 className="text-sm font-semibold text-charcoal-900 group-hover:text-forest-700 transition-colors line-clamp-2 leading-snug mb-2.5">
        {task.title}
      </h5>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.slice(0, 3).map((lbl, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-sand-100/80 text-sand-700 border border-sand-200/60"
            >
              {lbl}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-[10px] text-sand-500 font-medium self-center">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Blockers alert */}
      {task.blockers && task.blockers.length > 0 && (
        <div className="flex items-center gap-1 text-[11px] font-medium text-terracotta-700 bg-terracotta-50 border border-terracotta-100 rounded-md px-2 py-1 mb-2.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{task.blockers[0]}</span>
        </div>
      )}

      {/* Footer: Date, Comments, Attachments, Assignee */}
      <div className="flex items-center justify-between pt-2 border-t border-sand-100 mt-2">
        <div className="flex items-center gap-2.5 text-xs text-sand-500">
          {formattedDate && (
            <div
              className={`flex items-center gap-1 text-[11px] ${
                isOverdue ? 'text-terracotta-600 font-semibold' : 'text-sand-600'
              }`}
              title={isOverdue ? 'Overdue deadline' : 'Due date'}
            >
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
          )}

          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center gap-0.5 text-[11px] text-sand-500" title="Attachments">
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        <div className="flex items-center">
          {task.assignee ? (
            <Avatar
              src={task.assignee.avatar}
              name={task.assignee.name}
              size="xs"
            />
          ) : (
            <span className="text-[10px] text-sand-400 italic">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
};
