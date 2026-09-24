const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Issue = require('../models/Issue');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

// @desc    Add comment to Task, Issue, or Project
// @route   POST /api/comments
// @access  Private
exports.createComment = async (req, res, next) => {
  try {
    const { entityType, entityId, content, attachments } = req.body;

    const comment = await Comment.create({
      entityType,
      entityId,
      author: req.user.id,
      content,
      attachments: attachments || [],
    });

    let projectRef;
    let recipientUser;
    let titleStr = '';

    if (entityType === 'Task') {
      const task = await Task.findById(entityId);
      if (task) {
        projectRef = task.project;
        titleStr = `task "${task.title}"`;
        if (task.assignee && task.assignee.toString() !== req.user.id.toString()) {
          recipientUser = task.assignee;
        } else if (task.reporter && task.reporter.toString() !== req.user.id.toString()) {
          recipientUser = task.reporter;
        }
      }
    } else if (entityType === 'Issue') {
      const issue = await Issue.findById(entityId);
      if (issue) {
        projectRef = issue.project;
        titleStr = `issue "${issue.title}"`;
        if (issue.assignee && issue.assignee.toString() !== req.user.id.toString()) {
          recipientUser = issue.assignee;
        } else if (issue.reporter && issue.reporter.toString() !== req.user.id.toString()) {
          recipientUser = issue.reporter;
        }
      }
    }

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project: projectRef,
      action: 'added_comment',
      entityType: 'Comment',
      entityId: comment._id,
      description: `${req.user.name} commented on ${titleStr || entityType.toLowerCase()}`,
    });

    if (recipientUser) {
      await createNotification({
        recipient: recipientUser,
        sender: req.user.id,
        title: 'New Comment',
        message: `${req.user.name} commented on your ${entityType.toLowerCase()}.`,
        type: 'task_commented',
        link: projectRef ? `/projects/${projectRef}/tasks` : '/dashboard',
      });
    }

    const populated = await Comment.findById(comment._id).populate(
      'author',
      'name avatar email title role department'
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for an entity (Task/Issue/Project)
// @route   GET /api/comments/:entityType/:entityId
// @access  Private
exports.getComments = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;

    const comments = await Comment.find({ entityType, entityId })
      .populate('author', 'name avatar email title role department')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id.toString() && req.user.role !== 'organization_admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this comment',
      });
    }

    comment.content = content;
    await comment.save();

    const populated = await Comment.findById(comment._id).populate(
      'author',
      'name avatar email title'
    );

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id.toString() && req.user.role !== 'organization_admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment',
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
