const Task = require('../models/Task');
const Project = require('../models/Project');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      project,
      sprint,
      assignee,
      priority,
      status,
      storyPoints,
      dueDate,
      labels,
      dependencies,
      blockers,
      estimatedHours,
    } = req.body;

    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const taskCount = await Task.countDocuments({ project });
    const taskCode = `${projectDoc.projectCode || 'TSK'}-${taskCount + 1}`;

    const task = await Task.create({
      title,
      description: description || '',
      taskCode,
      project,
      sprint: sprint || undefined,
      assignee: assignee || undefined,
      reporter: req.user.id,
      priority: priority || 'Medium',
      status: status || 'Backlog',
      storyPoints: storyPoints || 1,
      dueDate: dueDate || undefined,
      labels: labels || [],
      dependencies: dependencies || [],
      blockers: blockers || [],
      estimatedHours: estimatedHours || 0,
      order: taskCount,
    });

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project,
      action: 'created_task',
      entityType: 'Task',
      entityId: task._id,
      description: `${req.user.name} created task "${task.title}" [${task.taskCode}]`,
    });

    if (assignee && assignee.toString() !== req.user.id.toString()) {
      await createNotification({
        recipient: assignee,
        sender: req.user.id,
        title: 'Task Assigned',
        message: `${req.user.name} assigned task "${task.title}" [${task.taskCode}] to you.`,
        type: 'task_assigned',
        link: `/projects/${project}/tasks`,
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar title')
      .populate('reporter', 'name email avatar title')
      .populate('project', 'name projectCode')
      .populate('sprint', 'name status');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks with filtering
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const {
      project,
      sprint,
      assignee,
      reporter,
      status,
      priority,
      search,
      myTasks,
      sort = '-createdAt',
    } = req.query;

    const query = {};

    if (project) query.project = project;
    if (sprint) query.sprint = sprint;
    if (status && status !== 'all') query.status = status;
    if (priority && priority !== 'all') query.priority = priority;
    if (reporter) query.reporter = reporter;

    if (myTasks === 'true' || assignee === 'me') {
      query.assignee = req.user.id;
    } else if (assignee && assignee !== 'all') {
      query.assignee = assignee;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { taskCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { labels: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar title department')
      .populate('reporter', 'name email avatar title')
      .populate('project', 'name projectCode')
      .populate('sprint', 'name status')
      .sort(sort);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar title department')
      .populate('reporter', 'name email avatar title')
      .populate('project', 'name projectCode projectManager members')
      .populate('sprint', 'name status startDate endDate')
      .populate('dependencies', 'title taskCode status priority')
      .populate('attachments.uploader', 'name avatar');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      sprint,
      assignee,
      priority,
      status,
      storyPoints,
      dueDate,
      labels,
      dependencies,
      blockers,
      estimatedHours,
      loggedHours,
      order,
    } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const oldAssignee = task.assignee ? task.assignee.toString() : null;
    const oldStatus = task.status;

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (sprint !== undefined) task.sprint = sprint || null;
    if (assignee !== undefined) task.assignee = assignee || null;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (storyPoints !== undefined) task.storyPoints = storyPoints;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (labels) task.labels = labels;
    if (dependencies) task.dependencies = dependencies;
    if (blockers) task.blockers = blockers;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (loggedHours !== undefined) task.loggedHours = loggedHours;
    if (order !== undefined) task.order = order;

    await task.save();

    // Log status change or assignment
    if (status && status !== oldStatus) {
      await logActivity({
        actor: req.user.id,
        organization: req.user.organization,
        project: task.project,
        action: 'updated_task_status',
        entityType: 'Task',
        entityId: task._id,
        description: `${req.user.name} moved task "${task.title}" [${task.taskCode}] from ${oldStatus} to ${status}`,
        metadata: { oldStatus, newStatus: status },
      });
    }

    if (assignee && assignee.toString() !== oldAssignee) {
      await logActivity({
        actor: req.user.id,
        organization: req.user.organization,
        project: task.project,
        action: 'assigned_task',
        entityType: 'Task',
        entityId: task._id,
        description: `${req.user.name} assigned task "${task.title}" [${task.taskCode}]`,
      });

      if (assignee.toString() !== req.user.id.toString()) {
        await createNotification({
          recipient: assignee,
          sender: req.user.id,
          title: 'Task Assigned',
          message: `${req.user.name} assigned task "${task.title}" to you.`,
          type: 'task_assigned',
          link: `/projects/${task.project}/tasks`,
        });
      }
    }

    const updatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar title department')
      .populate('reporter', 'name email avatar title')
      .populate('project', 'name projectCode')
      .populate('sprint', 'name status');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (Optimized for Kanban drag-and-drop)
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status, order } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const previousStatus = task.status;
    task.status = status;
    if (order !== undefined) task.order = order;

    await task.save();

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project: task.project,
      action: 'updated_task_status',
      entityType: 'Task',
      entityId: task._id,
      description: `${req.user.name} moved task "${task.title}" [${task.taskCode}] from ${previousStatus} to ${status}`,
      metadata: { previousStatus, newStatus: status },
    });

    // Notify assignee if someone else moved it
    if (task.assignee && task.assignee.toString() !== req.user.id.toString()) {
      await createNotification({
        recipient: task.assignee,
        sender: req.user.id,
        title: 'Task Status Updated',
        message: `Task "${task.title}" was moved to ${status} by ${req.user.name}.`,
        type: 'task_status_changed',
        link: `/projects/${task.project}/tasks`,
      });
    }

    const updated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar title')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name projectCode')
      .populate('sprint', 'name status');

    res.status(200).json({
      success: true,
      message: `Task moved to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add attachment to task
// @route   POST /api/tasks/:id/attachments
// @access  Private
exports.addAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const attachment = {
      name: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
      uploader: req.user.id,
      uploadedAt: new Date(),
    };

    task.attachments.push(attachment);
    await task.save();

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project: task.project,
      action: 'uploaded_attachment',
      entityType: 'Task',
      entityId: task._id,
      description: `${req.user.name} attached "${req.file.originalname}" to task "${task.title}"`,
    });

    const updated = await Task.findById(task._id).populate('attachments.uploader', 'name avatar');

    res.status(200).json({
      success: true,
      message: 'Attachment uploaded successfully',
      data: updated.attachments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attachment from task
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @access  Private
exports.deleteAttachment = async (req, res, next) => {
  try {
    const { id, attachmentId } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.attachments = task.attachments.filter((att) => att._id.toString() !== attachmentId);
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Attachment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin / PM / Reporter)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project: task.project,
      action: 'deleted_task',
      entityType: 'Task',
      entityId: task._id,
      description: `${req.user.name} deleted task "${task.title}" [${task.taskCode}]`,
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
