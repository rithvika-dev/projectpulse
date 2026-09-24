const Activity = require('../models/Activity');

// @desc    Get activity logs (Global, Org-wide, or Project-specific)
// @route   GET /api/activities
// @access  Private
exports.getActivities = async (req, res, next) => {
  try {
    const { project, entityType, limit = 50, page = 1 } = req.query;

    const query = {};
    if (req.user.organization) {
      query.organization = req.user.organization;
    }
    if (project) {
      query.project = project;
    }
    if (entityType) {
      query.entityType = entityType;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const activities = await Activity.find(query)
      .populate('actor', 'name email avatar title role')
      .populate('project', 'name projectCode')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Activity.countDocuments(query);

    res.status(200).json({
      success: true,
      count: activities.length,
      total,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
