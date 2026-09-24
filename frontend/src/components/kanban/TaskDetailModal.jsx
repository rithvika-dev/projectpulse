import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Badge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { taskService } from '../../services/taskService';
import { commentService } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  MessageSquare,
  Paperclip,
  Trash2,
  Send,
  Calendar,
  AlertTriangle,
  Upload,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const TaskDetailModal = ({
  isOpen,
  onClose,
  task,
  onTaskUpdated,
  onTaskDeleted,
  members = [],
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Backlog',
    priority: 'Medium',
    assignee: '',
    storyPoints: 1,
    dueDate: '',
    labels: '',
    blockers: '',
  });

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Backlog',
        priority: task.priority || 'Medium',
        assignee: task.assignee?._id || task.assignee || '',
        storyPoints: task.storyPoints !== undefined ? task.storyPoints : 1,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        labels: task.labels ? task.labels.join(', ') : '',
        blockers: task.blockers ? task.blockers.join(', ') : '',
      });

      // Load comments for task
      loadComments(task._id);
    }
  }, [task]);

  const loadComments = async (taskId) => {
    try {
      const res = await commentService.getComments('Task', taskId);
      if (res.success) {
        setComments(res.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignee: formData.assignee || null,
        storyPoints: Number(formData.storyPoints),
        dueDate: formData.dueDate || null,
        labels: formData.labels
          ? formData.labels.split(',').map((l) => l.trim()).filter(Boolean)
          : [],
        blockers: formData.blockers
          ? formData.blockers.split(',').map((b) => b.trim()).filter(Boolean)
          : [],
      };

      const res = await taskService.updateTask(task._id, payload);
      if (res.success) {
        onTaskUpdated(res.data);
      }
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await commentService.createComment({
        entityType: 'Task',
        entityId: task._id,
        content: newComment.trim(),
      });

      if (res.success) {
        setComments([...comments, res.data]);
        setNewComment('');
        success('Comment posted');
      }
    } catch (err) {
      error('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter((c) => c._id !== commentId));
      success('Comment removed');
    } catch (err) {
      error('Failed to remove comment');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await taskService.uploadAttachment(task._id, file);
      if (res.success) {
        onTaskUpdated({ ...task, attachments: res.data });
        success('Attachment uploaded successfully');
      }
    } catch (err) {
      error(err.response?.data?.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      await taskService.deleteAttachment(task._id, attachmentId);
      const updatedAtts = (task.attachments || []).filter((a) => a._id !== attachmentId);
      onTaskUpdated({ ...task, attachments: updatedAtts });
      success('Attachment deleted');
    } catch (err) {
      error('Failed to delete attachment');
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      try {
        await taskService.deleteTask(task._id);
        onTaskDeleted(task._id);
      } catch (err) {
        error('Failed to delete task');
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-sm px-2 py-0.5 rounded bg-sand-200 text-charcoal-800 font-bold">
            {task?.taskCode || 'TASK'}
          </span>
          <span className="text-base font-semibold text-charcoal-900 truncate">
            {task?.title}
          </span>
        </div>
      }
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDeleteTask}
            icon={Trash2}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete Task
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdate}
              isLoading={isUpdating}
              icon={CheckCircle2}
            >
              Save Changes
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (2 Cols) */}
        <div className="md:col-span-2 space-y-4">
          <Input
            label="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide context, acceptance criteria, or design notes..."
              className="block w-full rounded-lg border border-sand-300 bg-white text-sm text-charcoal-800 focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-100 p-3 shadow-subtle resize-y"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Labels (comma separated)"
              placeholder="Frontend, React, API"
              value={formData.labels}
              onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
            />
            <Input
              label="Blockers (if any)"
              placeholder="Waiting on API deploy"
              value={formData.blockers}
              onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
            />
          </div>

          {/* Attachments Section */}
          <div className="border-t border-sand-200 pt-4">
            <div className="flex items-center justify-between mb-2.5">
              <h6 className="text-xs font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-sand-600" />
                Attachments ({task?.attachments?.length || 0})
              </h6>
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-forest-600 hover:text-forest-700 bg-forest-50 hover:bg-forest-100 border border-forest-200 rounded-md px-2.5 py-1 transition-colors">
                <Upload className="w-3 h-3" />
                <span>Upload File</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            {task?.attachments && task.attachments.length > 0 ? (
              <div className="space-y-1.5">
                {task.attachments.map((att) => (
                  <div
                    key={att._id}
                    className="flex items-center justify-between p-2 rounded-lg bg-sand-50 border border-sand-200 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 text-sand-500 flex-shrink-0" />
                      <span className="font-medium text-charcoal-800 truncate">
                        {att.originalName || att.name}
                      </span>
                      {att.size && (
                        <span className="text-[10px] text-sand-500">
                          ({Math.round(att.size / 1024)} KB)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`http://localhost:5000${att.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-forest-600 hover:text-forest-700 font-medium inline-flex items-center gap-1"
                        download
                      >
                        <Download className="w-3 h-3" />
                        Download
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(att._id)}
                        className="text-sand-400 hover:text-red-600 p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-sand-500 italic">No attachments uploaded yet.</p>
            )}
          </div>

          {/* Comments Section */}
          <div className="border-t border-sand-200 pt-4">
            <h6 className="text-xs font-bold uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5 mb-3">
              <MessageSquare className="w-3.5 h-3.5 text-sand-600" />
              Activity & Comments ({comments.length})
            </h6>

            {/* Comments List */}
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div
                  key={comment._id}
                  className="flex items-start gap-2.5 bg-sand-50/60 p-3 rounded-xl border border-sand-200 text-xs"
                >
                  <Avatar
                    src={comment.author?.avatar}
                    name={comment.author?.name || 'User'}
                    size="xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-charcoal-900">
                        {comment.author?.name}
                      </span>
                      <span className="text-[10px] text-sand-500">
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-charcoal-700 leading-relaxed">{comment.content}</p>
                  </div>
                  {comment.author?._id === user?.id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-sand-400 hover:text-red-500 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-xs text-sand-500 italic">No comments yet.</p>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 rounded-lg border border-sand-300 bg-white text-xs px-3 py-2 text-charcoal-800 placeholder:text-sand-400 focus:outline-none focus:border-forest-500"
              />
              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={!newComment.trim() || isSubmittingComment}
                isLoading={isSubmittingComment}
                icon={Send}
              >
                Post
              </Button>
            </form>
          </div>
        </div>

        {/* Sidebar Attributes (1 Col) */}
        <div className="space-y-4 bg-sand-50/60 p-4 rounded-xl border border-sand-200 h-fit">
          <Select
            label="Status"
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

          <Select
            label="Assignee"
            value={formData.assignee}
            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
            placeholder="Unassigned"
            options={members.map((m) => ({
              value: m._id,
              label: `${m.name} (${m.role?.replace('_', ' ') || 'Member'})`,
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

          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />

          {task?.reporter && (
            <div className="border-t border-sand-200 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sand-500 block mb-1">
                Reporter
              </span>
              <div className="flex items-center gap-2">
                <Avatar
                  src={task.reporter.avatar}
                  name={task.reporter.name}
                  size="xs"
                />
                <span className="text-xs font-medium text-charcoal-800 truncate">
                  {task.reporter.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
