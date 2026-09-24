const Team = require('../models/Team');
const Task = require('../models/Task');
const { logActivity } = require('../services/activityService');

// @desc    Create a team
// @route   POST /api/teams
// @access  Private (Admin / PM)
exports.createTeam = async (req, res, next) => {
  try {
    const { name, description, teamLead, members, projects, color } = req.body;

    const team = await Team.create({
      name,
      description,
      organization: req.user.organization,
      teamLead: teamLead || req.user.id,
      members: members || [req.user.id],
      projects: projects || [],
      color: color || '#2F6B5F',
    });

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      action: 'created_team',
      entityType: 'Team',
      entityId: team._id,
      description: `${req.user.name} formed team "${team.name}"`,
    });

    const populatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'name email avatar title role')
      .populate('members', 'name email avatar title role')
      .populate('projects', 'name projectCode status progress');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: populatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all teams for user's organization
// @route   GET /api/teams
// @access  Private
exports.getTeams = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.organization) {
      filter.organization = req.user.organization;
    }

    const teams = await Team.find(filter)
      .populate('teamLead', 'name email avatar title role')
      .populate('members', 'name email avatar title role department')
      .populate('projects', 'name projectCode status progress priority')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single team by ID with workload details
// @route   GET /api/teams/:id
// @access  Private
exports.getTeamById = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('teamLead', 'name email avatar title role department phone')
      .populate('members', 'name email avatar title role department')
      .populate('projects', 'name projectCode status progress priority startDate endDate');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    // Compute workload for each member
    const memberIds = team.members.map((m) => m._id);
    const tasks = await Task.find({ assignee: { $in: memberIds } });

    const memberWorkload = team.members.map((member) => {
      const userTasks = tasks.filter(
        (t) => t.assignee && t.assignee.toString() === member._id.toString()
      );
      const completed = userTasks.filter((t) => t.status === 'Done').length;
      const inProgress = userTasks.filter((t) => t.status === 'In Progress').length;
      const review = userTasks.filter((t) => t.status === 'Review').length;
      const todo = userTasks.filter((t) => ['Backlog', 'To Do'].includes(t.status)).length;
      const totalPoints = userTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      return {
        member,
        totalTasks: userTasks.length,
        completedTasks: completed,
        inProgressTasks: inProgress,
        reviewTasks: review,
        pendingTasks: todo,
        storyPoints: totalPoints,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        team,
        workload: memberWorkload,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Admin / Team Lead / PM)
exports.updateTeam = async (req, res, next) => {
  try {
    const { name, description, teamLead, members, projects, color } = req.body;

    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    if (name) team.name = name;
    if (description !== undefined) team.description = description;
    if (teamLead) team.teamLead = teamLead;
    if (members) team.members = members;
    if (projects) team.projects = projects;
    if (color) team.color = color;

    await team.save();

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      action: 'updated_team',
      entityType: 'Team',
      entityId: team._id,
      description: `${req.user.name} updated team "${team.name}"`,
    });

    const updatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'name email avatar title role')
      .populate('members', 'name email avatar title role')
      .populate('projects', 'name projectCode status progress');

    res.status(200).json({
      success: true,
      message: 'Team updated successfully',
      data: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Admin only)
exports.deleteTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found',
      });
    }

    await team.deleteOne();

    await logActivity({
      actor: req.user.id,
      organization: req.user.organization,
      action: 'deleted_team',
      entityType: 'Team',
      entityId: team._id,
      description: `${req.user.name} deleted team "${team.name}"`,
    });

    res.status(200).json({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
