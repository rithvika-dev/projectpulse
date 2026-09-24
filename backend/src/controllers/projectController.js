const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Sprint = require('../models/Sprint');
const Issue = require('../models/Issue');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin / Project Manager)
exports.createProject = async (req, res, next) => {
  try {
    const {
      name,
      description,
      projectCode,
      projectManager,
      team,
      members,
      status,
      priority,
      startDate,
      endDate,
      tags,
      budget,
      color,
    } = req.body;

    const code = projectCode ? projectCode.toUpperCase().trim() : name.substring(0, 4).toUpperCase();

    // Check code uniqueness within org
    const existing = await Project.findOne({
      organization: req.user.organization,
      projectCode: code,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Project with code "${code}" already exists in your organization.`,
        errors: ['Duplicate project code'],
      });
    }

    const project = await Project.create({
      name,
      description,
      projectCode: code,
      organization: req.user.organization,
      projectManager: projectManager || req.user.id,
      team,
      members: members && members.length > 0 ? members : [req.user.id],
      status: status || 'Planning',
      priority: priority || 'Medium',
      startDate: startDate || new Date(),
      endDate,
      tags: tags || [],
      budget: budget || 0,
      color: color || '#2F6B5F',
    });

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project: project._id,
      action: 'created_project',
      entityType: 'Project',
      entityId: project._id,
      description: `${req.user.name} created project "${project.name}" [${project.projectCode}]`,
    });

    if (projectManager && projectManager.toString() !== req.user.id.toString()) {
      await createNotification({
        recipient: projectManager,
        sender: req.user.id,
        title: 'Assigned as Project Manager',
        message: `You were assigned as the Project Manager for "${project.name}".`,
        type: 'project_invitation',
        link: `/projects/${project._id}`,
      });
    }

    const populated = await Project.findById(project._id)
      .populate('projectManager', 'name email avatar title')
      .populate('team', 'name color members')
      .populate('members', 'name email avatar title role');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects with search, filter, and pagination
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    const { status, priority, manager, search, sort = '-createdAt' } = req.query;

    const query = {};
    if (req.user.organization) {
      query.organization = req.user.organization;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (manager && manager !== 'all') {
      query.projectManager = manager;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { projectCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const projects = await Project.find(query)
      .populate('projectManager', 'name email avatar title')
      .populate('team', 'name color')
      .populate('members', 'name email avatar title role')
      .sort(sort);

    // Calculate real-time progress for each project based on tasks
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({
          project: project._id,
          status: 'Done',
        });
        const openIssues = await Issue.countDocuments({
          project: project._id,
          status: { $in: ['Open', 'In Progress'] },
        });

        const calculatedProgress =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : project.progress || 0;

        return {
          ...project.toObject(),
          totalTasks,
          completedTasks,
          openIssues,
          calculatedProgress,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: projectsWithCounts.length,
      data: projectsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID with full overview
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('projectManager', 'name email avatar title phone department')
      .populate({
        path: 'team',
        populate: { path: 'members', select: 'name email avatar title role' },
      })
      .populate('members', 'name email avatar title role department');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Task and sprint metrics
    const totalTasks = await Task.countDocuments({ project: project._id });
    const doneTasks = await Task.countDocuments({ project: project._id, status: 'Done' });
    const inProgressTasks = await Task.countDocuments({ project: project._id, status: 'In Progress' });
    const reviewTasks = await Task.countDocuments({ project: project._id, status: 'Review' });
    const todoTasks = await Task.countDocuments({ project: project._id, status: { $in: ['Backlog', 'To Do'] } });

    const totalIssues = await Issue.countDocuments({ project: project._id });
    const openIssues = await Issue.countDocuments({
      project: project._id,
      status: { $in: ['Open', 'In Progress'] },
    });
    const criticalIssues = await Issue.countDocuments({
      project: project._id,
      severity: { $in: ['Critical', 'Blocker'] },
      status: { $in: ['Open', 'In Progress'] },
    });

    const activeSprint = await Sprint.findOne({ project: project._id, status: 'Active' });
    const totalMilestones = await Milestone.countDocuments({ project: project._id });
    const completedMilestones = await Milestone.countDocuments({
      project: project._id,
      status: 'Completed',
    });

    const progressPercentage =
      totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : project.progress || 0;

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        metrics: {
          totalTasks,
          doneTasks,
          inProgressTasks,
          reviewTasks,
          todoTasks,
          progressPercentage,
          totalIssues,
          openIssues,
          criticalIssues,
          totalMilestones,
          completedMilestones,
          activeSprint,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin / Project Manager)
exports.updateProject = async (req, res, next) => {
  try {
    const {
      name,
      description,
      projectManager,
      team,
      members,
      status,
      priority,
      startDate,
      endDate,
      progress,
      tags,
      budget,
      color,
    } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (projectManager) project.projectManager = projectManager;
    if (team !== undefined) project.team = team;
    if (members) project.members = members;
    if (status) project.status = status;
    if (priority) project.priority = priority;
    if (startDate) project.startDate = startDate;
    if (endDate !== undefined) project.endDate = endDate;
    if (progress !== undefined) project.progress = progress;
    if (tags) project.tags = tags;
    if (budget !== undefined) project.budget = budget;
    if (color) project.color = color;

    await project.save();

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      project: project._id,
      action: 'updated_project',
      entityType: 'Project',
      entityId: project._id,
      description: `${req.user.name} updated project details for "${project.name}"`,
    });

    const updated = await Project.findById(project._id)
      .populate('projectManager', 'name email avatar title')
      .populate('team', 'name color')
      .populate('members', 'name email avatar title role');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Clean up related entities
    await Task.deleteMany({ project: project._id });
    await Issue.deleteMany({ project: project._id });
    await Milestone.deleteMany({ project: project._id });
    await Sprint.deleteMany({ project: project._id });

    await project.deleteOne();

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      action: 'deleted_project',
      entityType: 'Project',
      entityId: project._id,
      description: `${req.user.name} removed project "${project.name}"`,
    });

    res.status(200).json({
      success: true,
      message: 'Project and all associated items deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get project timeline (Milestones + Sprints)
// @route   GET /api/projects/:id/timeline
// @access  Private
exports.getProjectTimeline = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const milestones = await Milestone.find({ project: req.params.id })
      .populate('owner', 'name avatar')
      .sort({ dueDate: 1 });

    const sprints = await Sprint.find({ project: req.params.id }).sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        project: {
          id: project._id,
          name: project.name,
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status,
          progress: project.progress,
        },
        milestones,
        sprints,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private (Admin / PM)
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    project.members.push(userId);
    await project.save();

    await createNotification({
      recipient: userId,
      sender: req.user.id,
      title: 'Added to Project',
      message: `You were added to project "${project.name}".`,
      type: 'project_invitation',
      link: `/projects/${project._id}`,
    });

    const updated = await Project.findById(project._id).populate(
      'members',
      'name email avatar title role'
    );

    res.status(200).json({
      success: true,
      message: 'Member added to project successfully',
      data: updated.members,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Private (Admin / PM)
exports.removeMember = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.members = project.members.filter((m) => m.toString() !== userId);
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Member removed from project successfully',
    });
  } catch (error) {
    next(error);
  }
};
