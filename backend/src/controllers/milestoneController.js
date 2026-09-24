const Milestone = require('../models/Milestone');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

// @desc    Create milestone
// @route   POST /api/milestones
// @access  Private (Admin / PM / Lead)
exports.createMilestone = async (req, res, next) => {
  try {
    const { title, description, project, startDate, dueDate, status, progress, owner } =
      req.body;

    const milestone = await Milestone.create({
      title,
      description,
      project,
      startDate: startDate || new Date(),
      dueDate,
      status: status || 'Not Started',
      progress: progress || 0,
      owner: owner || req.user.id,
    });

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project,
      action: 'created_milestone',
      entityType: 'Milestone',
      entityId: milestone._id,
      description: `${req.user.name} created milestone "${milestone.title}"`,
    });

    const populated = await Milestone.findById(milestone._id).populate(
      'owner',
      'name avatar email title'
    );

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get milestones for project
// @route   GET /api/milestones
// @access  Private
exports.getMilestones = async (req, res, next) => {
  try {
    const { project, status } = req.query;

    const query = {};
    if (project) query.project = project;
    if (status && status !== 'all') query.status = status;

    const milestones = await Milestone.find(query)
      .populate('owner', 'name avatar email title')
      .populate('project', 'name projectCode')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      count: milestones.length,
      data: milestones,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single milestone by ID
// @route   GET /api/milestones/:id
// @access  Private
exports.getMilestoneById = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id)
      .populate('owner', 'name avatar email title')
      .populate('project', 'name projectCode');

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private
exports.updateMilestone = async (req, res, next) => {
  try {
    const { title, description, startDate, dueDate, status, progress, owner } = req.body;

    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    if (title) milestone.title = title;
    if (description !== undefined) milestone.description = description;
    if (startDate) milestone.startDate = startDate;
    if (dueDate) milestone.dueDate = dueDate;
    if (status) {
      milestone.status = status;
      if (status === 'Completed') milestone.progress = 100;
    }
    if (progress !== undefined) {
      milestone.progress = progress;
      if (progress === 100 && milestone.status !== 'Completed') {
        milestone.status = 'Completed';
      }
    }
    if (owner) milestone.owner = owner;

    await milestone.save();

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project: milestone.project,
      action: status === 'Completed' ? 'completed_milestone' : 'updated_milestone',
      entityType: 'Milestone',
      entityId: milestone._id,
      description: `${req.user.name} updated milestone "${milestone.title}" (Status: ${milestone.status})`,
    });

    const updated = await Milestone.findById(milestone._id).populate(
      'owner',
      'name avatar email title'
    );

    res.status(200).json({
      success: true,
      message: 'Milestone updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private (Admin / PM)
exports.deleteMilestone = async (req, res, next) => {
  try {
    const milestone = await Milestone.findById(req.params.id);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
      });
    }

    await milestone.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Milestone deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
