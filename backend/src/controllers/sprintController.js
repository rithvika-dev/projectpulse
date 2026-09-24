const Sprint = require('../models/Sprint');
const Task = require('../models/Task');
const { logActivity } = require('../services/activityService');
const { notifyMany } = require('../services/notificationService');

// @desc    Create sprint
// @route   POST /api/sprints
// @access  Private (Admin / PM / Lead)
exports.createSprint = async (req, res, next) => {
  try {
    const { name, project, goal, startDate, endDate, tasks } = req.body;

    const sprint = await Sprint.create({
      name,
      project,
      goal: goal || '',
      startDate,
      endDate,
      status: 'Planned',
      tasks: tasks || [],
    });

    // If tasks were provided, update task sprint reference
    if (tasks && tasks.length > 0) {
      await Task.updateMany({ _id: { $in: tasks } }, { sprint: sprint._id });
    }

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project,
      action: 'created_sprint',
      entityType: 'Sprint',
      entityId: sprint._id,
      description: `${req.user.name} created sprint "${sprint.name}"`,
    });

    res.status(201).json({
      success: true,
      message: 'Sprint created successfully',
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sprints for project
// @route   GET /api/sprints
// @access  Private
exports.getSprints = async (req, res, next) => {
  try {
    const { project, status } = req.query;

    const query = {};
    if (project) query.project = project;
    if (status && status !== 'all') query.status = status;

    const sprints = await Sprint.find(query)
      .populate('project', 'name projectCode')
      .populate({
        path: 'tasks',
        populate: { path: 'assignee', select: 'name avatar email' },
      })
      .sort({ startDate: -1 });

    // Attach computed sprint metrics
    const sprintsWithMetrics = await Promise.all(
      sprints.map(async (sprint) => {
        const sprintTasks = await Task.find({ sprint: sprint._id });
        const total = sprintTasks.length;
        const done = sprintTasks.filter((t) => t.status === 'Done').length;
        const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const completedPoints = sprintTasks
          .filter((t) => t.status === 'Done')
          .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

        return {
          ...sprint.toObject(),
          totalTasks: total,
          doneTasks: done,
          totalPoints,
          completedPoints,
          progressPercentage: total > 0 ? Math.round((done / total) * 100) : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: sprintsWithMetrics.length,
      data: sprintsWithMetrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single sprint with full task board
// @route   GET /api/sprints/:id
// @access  Private
exports.getSprintById = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate('project', 'name projectCode members')
      .populate({
        path: 'tasks',
        populate: [
          { path: 'assignee', select: 'name avatar email title' },
          { path: 'reporter', select: 'name avatar email' },
        ],
      });

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    const sprintTasks = await Task.find({ sprint: sprint._id })
      .populate('assignee', 'name avatar email title')
      .populate('reporter', 'name avatar email')
      .sort({ order: 1, createdAt: -1 });

    const totalTasks = sprintTasks.length;
    const doneTasks = sprintTasks.filter((t) => t.status === 'Done').length;
    const inProgressTasks = sprintTasks.filter((t) => t.status === 'In Progress').length;
    const totalPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const donePoints = sprintTasks
      .filter((t) => t.status === 'Done')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        sprint,
        tasks: sprintTasks,
        metrics: {
          totalTasks,
          doneTasks,
          inProgressTasks,
          totalPoints,
          donePoints,
          progressPercentage: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update sprint
// @route   PUT /api/sprints/:id
// @access  Private
exports.updateSprint = async (req, res, next) => {
  try {
    const { name, goal, startDate, endDate, status } = req.body;

    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    if (name) sprint.name = name;
    if (goal !== undefined) sprint.goal = goal;
    if (startDate) sprint.startDate = startDate;
    if (endDate) sprint.endDate = endDate;
    if (status) sprint.status = status;

    await sprint.save();

    res.status(200).json({
      success: true,
      message: 'Sprint updated successfully',
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start sprint
// @route   POST /api/sprints/:id/start
// @access  Private (Admin / PM / Lead)
exports.startSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id).populate('project');
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    sprint.status = 'Active';
    await sprint.save();

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project: sprint.project._id,
      action: 'started_sprint',
      entityType: 'Sprint',
      entityId: sprint._id,
      description: `${req.user.name} started sprint "${sprint.name}"`,
    });

    // Notify project members
    if (sprint.project && sprint.project.members) {
      await notifyMany(sprint.project.members, {
        sender: req.user.id,
        title: 'Sprint Started',
        message: `Sprint "${sprint.name}" has officially started for project "${sprint.project.name}".`,
        type: 'sprint_started',
        link: `/projects/${sprint.project._id}/sprints`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Sprint "${sprint.name}" started successfully!`,
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete sprint
// @route   POST /api/sprints/:id/complete
// @access  Private (Admin / PM / Lead)
exports.completeSprint = async (req, res, next) => {
  try {
    const { moveToBacklog } = req.body;
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    sprint.status = 'Completed';
    await sprint.save();

    // If incomplete tasks exist, move them to Backlog if requested
    if (moveToBacklog) {
      await Task.updateMany(
        { sprint: sprint._id, status: { $ne: 'Done' } },
        { status: 'Backlog', $unset: { sprint: 1 } }
      );
    }

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project: sprint.project,
      action: 'completed_sprint',
      entityType: 'Sprint',
      entityId: sprint._id,
      description: `${req.user.name} completed sprint "${sprint.name}"`,
    });

    res.status(200).json({
      success: true,
      message: `Sprint "${sprint.name}" completed successfully!`,
      data: sprint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
// @access  Private (Admin / PM)
exports.deleteSprint = async (req, res, next) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: 'Sprint not found',
      });
    }

    // Unlink tasks from this sprint
    await Task.updateMany({ sprint: sprint._id }, { $unset: { sprint: 1 } });
    await sprint.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Sprint deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
